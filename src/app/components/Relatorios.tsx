import React, { useState, useMemo } from 'react';
import { Transacao, ModeloConfig } from '../types';
import { formatarMoeda } from '../utils/calculos';
import { Download, Share2, TrendingUp, TrendingDown, DollarSign, Package, FileText } from 'lucide-react';

interface RelatoriosProps {
  transacoes: Transacao[];
  modelos: ModeloConfig[];
}

export function Relatorios({ transacoes, modelos }: RelatoriosProps) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const dadosFiltrados = useMemo(() => {
    return transacoes.filter(t => {
      const data = new Date(t.data);
      return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
    }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [transacoes, mesSelecionado, anoSelecionado]);

  const resumo = useMemo(() => {
    let faturamentoBruto = 0;
    let custosTotais = 0;
    let lucroLiquido = 0;
    let qtdReformas = 0;
    let qtdFabricacao = 0;

    dadosFiltrados.forEach(t => {
      if (t.tipo === 'entrada') {
        faturamentoBruto += t.valorTotal;
        custosTotais += t.custoOperacao; // Materiais + Insumos (Capital de Giro)
        lucroLiquido += t.maoObra; // Renda Disponível

        const qtd = t.itens ? t.itens.reduce((acc, item) => acc + item.quantidade, 0) : 1;
        
        if (t.tipoOperacao === 'reforma') {
            qtdReformas += qtd;
        } else {
            qtdFabricacao += qtd;
        }
      } else if (t.tipo === 'saida') {
        // Despesas aumentam os custos totais (saem do capital de giro)
        custosTotais += t.valor;
      }
      // Retiradas não afetam o lucro gerado nem custos operacionais, são apenas transferências
    });

    return {
      faturamentoBruto,
      custosTotais,
      lucroLiquido,
      qtdReformas,
      qtdFabricacao
    };
  }, [dadosFiltrados]);

  const exportarCSV = () => {
    const headers = ["Data", "Descrição", "Tipo", "Modelo", "Valor Total", "Lucro (Mão de Obra)"];
    
    const rows = dadosFiltrados.map(t => {
      const data = new Date(t.data).toLocaleDateString('pt-BR');
      
      let descricao = '';
      let tipo = '';
      let modelo = '-';
      let valor = 0;
      let lucro = 0;

      if (t.tipo === 'entrada') {
        descricao = 'Venda';
        tipo = t.tipoOperacao === 'reforma' ? 'Reforma' : 'Fabricação';
        modelo = modelos.find(m => m.id === t.modeloId)?.nome || 'Vários';
        valor = t.valorTotal;
        lucro = t.maoObra;
      } else if (t.tipo === 'saida') {
        descricao = t.descricao;
        tipo = 'Despesa';
        valor = t.valor;
        lucro = 0;
      } else if (t.tipo === 'retirada') {
        descricao = t.descricao;
        tipo = 'Retirada';
        valor = t.valor;
        lucro = -t.valor; // Representa saída de lucro
      }

      return [data, descricao, tipo, modelo, valor.toFixed(2).replace('.', ','), lucro.toFixed(2).replace('.', ',')];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${meses[mesSelecionado]}_${anoSelecionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const compartilharResumo = async () => {
    const texto = `
📊 *Resumo Mensal - ${meses[mesSelecionado]}/${anoSelecionado}*

💰 *Faturamento Bruto:* ${formatarMoeda(resumo.faturamentoBruto)}
🛑 *Custos Totais:* ${formatarMoeda(resumo.custosTotais)}
✅ *Lucro Líquido:* ${formatarMoeda(resumo.lucroLiquido)}

📦 *Produção:*
🛠️ Reformas: ${resumo.qtdReformas}
🪑 Fabricação: ${resumo.qtdFabricacao}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório ${meses[mesSelecionado]}/${anoSelecionado}`,
          text: texto,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar para área de transferência
      navigator.clipboard.writeText(texto);
      alert('Resumo copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Filtros */}
      <div className="flex gap-4 bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-sm">
        <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Mês</label>
            <select 
                value={mesSelecionado} 
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[#243645] font-medium focus:outline-none focus:ring-2 focus:ring-[#243645]"
            >
                {meses.map((mes, index) => (
                    <option key={index} value={index}>{mes}</option>
                ))}
            </select>
        </div>
        <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Ano</label>
            <select 
                value={anoSelecionado} 
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[#243645] font-medium focus:outline-none focus:ring-2 focus:ring-[#243645]"
            >
                {anos.map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3">
        {/* Faturamento */}
        <div className="bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Faturamento Bruto</span>
            </div>
            <p className="text-2xl font-bold text-[#243645]">{formatarMoeda(resumo.faturamentoBruto)}</p>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-[20px] border border-emerald-100 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm text-emerald-800 font-medium">Lucro Líquido</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatarMoeda(resumo.lucroLiquido)}</p>
            <p className="text-xs text-emerald-600 mt-1">Valor real para mão de obra</p>
        </div>

        {/* Custos */}
        <div className="bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Custos Totais</span>
            </div>
            <p className="text-xl font-bold text-[#243645]">{formatarMoeda(resumo.custosTotais)}</p>
        </div>

        {/* Volume */}
        <div className="bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Produção</span>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reformas:</span>
                    <span className="font-bold text-[#243645]">{resumo.qtdReformas}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fabricação:</span>
                    <span className="font-bold text-[#243645]">{resumo.qtdFabricacao}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Ações de Exportação */}
      <div className="flex gap-3">
        <button 
            onClick={exportarCSV}
            className="flex-1 flex items-center justify-center gap-2 bg-[#243645] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#1a2833] transition-colors"
        >
            <Download className="w-4 h-4" />
            Exportar Excel
        </button>
        <button 
            onClick={compartilharResumo}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
            <Share2 className="w-4 h-4" />
            Compartilhar
        </button>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-[20px] border border-[#e5e5e5] overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-[#e5e5e5]">
            <h3 className="font-semibold text-[#243645] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalhamento Mensal
            </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3 text-right">Valor</th>
                        <th className="px-4 py-3 text-right">Lucro</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {dadosFiltrados.length > 0 ? (
                        dadosFiltrados.map((t) => {
                            const isEntrada = t.tipo === 'entrada';
                            const isRetirada = t.tipo === 'retirada';
                            return (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                        {new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#243645]">
                                        {isEntrada 
                                            ? modelos.find(m => m.id === t.modeloId)?.nome || 'Venda'
                                            : t.descricao || (isRetirada ? 'Retirada' : 'Despesa')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isEntrada ? (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                t.tipoOperacao === 'reforma' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {t.tipoOperacao === 'reforma' ? 'Reforma' : 'Fabricação'}
                                            </span>
                                        ) : isRetirada ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                                                Retirada
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                                                Despesa
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${isEntrada ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {isEntrada ? '+' : '-'}{formatarMoeda(isEntrada ? t.valorTotal : t.valor)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-[#243645]">
                                        {isEntrada ? formatarMoeda(t.maoObra) : '-'}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                Nenhuma movimentação neste mês
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
