import { useState, useEffect } from 'react';
import { Transacao, Saldos } from '../types';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY_TRANSACOES = 'fluxo_caixa_transacoes';

export function useStorage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldos, setSaldos] = useState<Saldos>({
    capitalGiro: 0,
    rendaDisponivel: 0,
    fundoReserva: 0,
    totalReformas: 0,
    totalFabricacao: 0,
  });

  // Função auxiliar para calcular saldos
  const calcularSaldos = (listaTransacoes: Transacao[]) => {
    const novosSaldos = {
      capitalGiro: 0,
      rendaDisponivel: 0,
      fundoReserva: 0,
      totalReformas: 0,
      totalFabricacao: 0,
    };

    listaTransacoes.forEach(transacao => {
      if (transacao.tipo === 'entrada') {
        // Garantir que valores sejam números
        const custoOperacao = Number(transacao.custoOperacao || 0);
        const maoObra = Number(transacao.maoObra || 0);
        const margemExcedente = Number(transacao.margemExcedente || 0);
        const valorTotal = Number(transacao.valorTotal || (transacao as any).valor || 0);

        novosSaldos.capitalGiro += custoOperacao;
        novosSaldos.rendaDisponivel += maoObra;
        novosSaldos.fundoReserva += margemExcedente;

        if (transacao.tipoOperacao === 'reforma') {
          novosSaldos.totalReformas += valorTotal;
        } else if (transacao.tipoOperacao === 'fabricacao') {
          novosSaldos.totalFabricacao += valorTotal;
        }
      } else if (transacao.tipo === 'retirada') {
        novosSaldos.rendaDisponivel -= Number(transacao.valor || 0);
      } else {
        // Despesa
        novosSaldos.capitalGiro -= Number(transacao.valor || 0);
      }
    });

    setSaldos(novosSaldos);
  };

  // Carregar dados do Supabase ao iniciar
  useEffect(() => {
    carregarTransacoes();
  }, []);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      if (data) {
        const transacoesFormatadas: Transacao[] = data.map((t: any) => {
          const base = {
            id: t.id,
            data: t.data,
            descricao: t.descricao,
            tipo: t.tipo,
          };

          if (t.tipo === 'entrada') {
            return {
              ...base,
              modeloId: t.modelo_id,
              materialId: t.material_id,
              custoOperacao: Number(t.custo_operacao),
              maoObra: Number(t.mao_obra),
              margemExcedente: Number(t.margem_excedente),
              tipoOperacao: t.tipo_operacao,
              valorTotal: Number(t.valor),
              itens: t.itens,
            } as any as Transacao;
          } else if (t.tipo === 'saida') {
            return {
              ...base,
              valor: Number(t.valor),
              categoria: t.categoria,
              itens: t.itens,
            } as any as Transacao;
          } else {
            return {
              ...base,
              valor: Number(t.valor),
            } as any as Transacao;
          }
        });

        const localData = localStorage.getItem(STORAGE_KEY_TRANSACOES);
        if (transacoesFormatadas.length === 0 && localData) {
          console.log('Iniciando migração automática para Supabase...');
          const parsedLocal: Transacao[] = JSON.parse(localData);
          if (parsedLocal.length > 0) {
            // Migrar dados
            for (const t of parsedLocal) {
              await adicionarTransacaoSupabase(t);
            }
            // Recarregar após migração
            return carregarTransacoes();
          }
        }

        setTransacoes(transacoesFormatadas);
        calcularSaldos(transacoesFormatadas);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função interna para adicionar no Supabase (usada na migração e no add normal)
  const adicionarTransacaoSupabase = async (transacao: Transacao) => {
    // Converter para snake_case
    const dbPayload: any = {
      id: transacao.id,
      data: transacao.data,
      descricao: (transacao as any).descricao,
      tipo: transacao.tipo,
    };

    if (transacao.tipo === 'entrada') {
      const t = transacao as any; // Cast para acessar propriedades de Venda
      dbPayload.valor = t.valorTotal;
      dbPayload.modelo_id = t.modeloId || null;
      dbPayload.material_id = t.materialId || null;
      dbPayload.custo_operacao = t.custoOperacao || 0;
      dbPayload.mao_obra = t.maoObra || 0;
      dbPayload.margem_excedente = t.margemExcedente || 0;
      dbPayload.tipo_operacao = t.tipoOperacao || null;
      dbPayload.itens = t.itens || [];
    } else {
      const t = transacao as any; // Cast para acessar propriedades de Despesa/Retirada
      dbPayload.valor = t.valor;
      if (transacao.tipo === 'saida') {
        dbPayload.categoria = t.categoria || null;
        dbPayload.itens = t.itens || [];
      }
    }

    const { error } = await supabase.from('transacoes').insert(dbPayload);
    if (error) throw error;
  };

  const adicionarTransacao = async (transacao: Transacao) => {
    try {
      // Otimistic update
      const novasTransacoes = [transacao, ...transacoes];
      setTransacoes(novasTransacoes);
      calcularSaldos(novasTransacoes);

      await adicionarTransacaoSupabase(transacao);
      
      // Recarregar para garantir sincronia (opcional, mas bom para garantir IDs gerados se fosse o caso)
      // await carregarTransacoes(); 
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      // Reverter em caso de erro (seria ideal)
      carregarTransacoes();
    }
  };

  const removerTransacao = async (id: string) => {
    try {
      console.log('Tentando remover transação:', id);
      
      // Otimistic update usando callback funcional para evitar stale state
      setTransacoes(prevTransacoes => {
        const novas = prevTransacoes.filter(t => t.id !== id);
        // Recalcular saldos com base no novo estado
        // Nota: calcularSaldos chama setSaldos, o que é um side-effect dentro de setState updater.
        // Idealmente deveríamos usar useEffect para saldos, mas para manter a lógica simples aqui:
        setTimeout(() => calcularSaldos(novas), 0);
        return novas;
      });

      const { error, count, status, statusText } = await supabase
        .from('transacoes')
        .delete({ count: 'exact' })
        .eq('id', id);

      console.log('Resultado da exclusão:', { error, count, status, statusText, id });

      if (error) {
        throw error;
      }
      
      if (count === 0) {
        console.warn('Nenhuma transação foi removida do banco de dados. ID não encontrado:', id);
        // Se não encontrou, pode ser que o ID fosse temporário e o INSERT falhou ou ainda não chegou.
        // Ou o usuário já deletou.
        // Vamos alertar apenas se realmente parecer um erro.
        alert('A transação não foi encontrada no servidor. A lista será atualizada.');
        await carregarTransacoes();
      } else {
        console.log('Transação removida com sucesso do Supabase.');
        // Feedback visual opcional, o usuário já vê o item sumir.
      }
    } catch (error: any) {
      console.error('Erro ao remover transação:', error);
      alert(`Não foi possível excluir: ${error.message || 'Erro desconhecido'}`);
      await carregarTransacoes();
    }
  };

  const limparDados = async () => {
    if (confirm('ATENÇÃO: Isso apagará TODAS as transações do banco de dados e do seu dispositivo. Essa ação não pode ser desfeita. Tem certeza?')) {
      try {
        setLoading(true);
        
        // 1. Limpar localStorage para evitar migração indesejada
        localStorage.removeItem(STORAGE_KEY_TRANSACOES);
        
        // 2. Limpar Supabase
        // O hack neq('id', '0000...') funciona se a policy permitir.
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); 
        
        if (error) {
          throw error;
        }

        // 3. Limpar estado local
        setTransacoes([]);
        setSaldos({
          capitalGiro: 0,
          rendaDisponivel: 0,
          fundoReserva: 0,
          totalReformas: 0,
          totalFabricacao: 0,
        });
        
        alert('Banco de dados limpo com sucesso.');
      } catch (error: any) {
        console.error('Erro ao limpar dados:', error);
        alert(`Erro ao limpar dados: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    transacoes,
    saldos,
    loading,
    adicionarTransacao,
    removerTransacao,
    limparDados,
  };
}