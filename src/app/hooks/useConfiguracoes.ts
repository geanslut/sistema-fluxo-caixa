import { useState, useEffect } from 'react';
import { Configuracoes, Material, CustoFixo, ModeloConfig } from '../types';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY_CONFIG = 'fluxo_caixa_configuracoes';

// Configurações padrão (mantidas para fallback ou reset)
const defaultConfiguracoes: Configuracoes = {
  materiais: [
    { id: 'fibra', nome: 'Fibra', precoPorKg: 14.0, cor: '#8B4513' },
    { id: 'fio', nome: 'Fio', precoPorKg: 23.0, cor: '#4B0082' },
  ],
  custosFixos: [
    { id: 'taxa_insumos', descricao: 'Taxa de Insumos', valor: 10.0 },
  ],
  modelos: [
    {
      id: 'cestinha',
      nome: 'Cestinha',
      consumoPorMaterial: { fibra: 1.0, fio: 1.0 },
      maoObraPorMaterial: { fibra: 100, fio: 50 },
      custoFerro: 40,
    },
    {
      id: 'banqueta',
      nome: 'Banqueta',
      consumoPorMaterial: { fibra: 1.0, fio: 1.0 },
      maoObraPorMaterial: { fibra: 100, fio: 50 },
      custoFerro: 40,
    },
    {
      id: 'cadeira_loja',
      nome: 'Cadeira de Loja',
      consumoPorMaterial: { fibra: 1.5, fio: 2.0 },
      maoObraPorMaterial: { fibra: 100, fio: 50 },
      custoFerro: 50,
    },
    {
      id: 'mesa',
      nome: 'Mesa',
      consumoPorMaterial: { fibra: 1.5, fio: 2.0 },
      maoObraPorMaterial: { fibra: 100, fio: 50 },
      custoFerro: 60,
    },
    {
      id: 'cadeira_tradicional',
      nome: 'Cadeira Tradicional',
      consumoPorMaterial: { fibra: 1.0, fio: 1.5 },
      maoObraPorMaterial: { fibra: 100, fio: 50 },
      custoFerro: 45,
    },
  ],
};

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>(defaultConfiguracoes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      const [resMateriais, resCustos, resModelos] = await Promise.all([
        supabase.from('materiais').select('*'),
        supabase.from('custos_fixos').select('*'),
        supabase.from('modelos').select('*'),
      ]);

      if (resMateriais.error) throw resMateriais.error;
      if (resCustos.error) throw resCustos.error;
      if (resModelos.error) throw resModelos.error;

      const materiais = resMateriais.data.map((m: any) => ({
        id: m.id,
        nome: m.nome,
        precoPorKg: Number(m.preco_por_kg),
        cor: m.cor,
      }));

      const custosFixos = resCustos.data.map((c: any) => ({
        id: c.id,
        descricao: c.descricao,
        valor: Number(c.valor),
      }));

      const modelos = resModelos.data.map((m: any) => ({
        id: m.id,
        nome: m.nome,
        consumoPorMaterial: m.consumo_por_material,
        maoObraPorMaterial: m.mao_obra_por_material,
        custoFerro: Number(m.custo_ferro),
      }));

      // Migração: se tudo estiver vazio, tentar carregar do localStorage
      if (materiais.length === 0 && custosFixos.length === 0 && modelos.length === 0) {
        const localConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (localConfig) {
          console.log('Migrando configurações para Supabase...');
          const parsed = JSON.parse(localConfig);
          
          // Migrar
          for (const m of parsed.materiais || []) await adicionarMaterialSupabase(m);
          for (const c of parsed.custosFixos || []) await adicionarCustoSupabase(c);
          for (const m of parsed.modelos || []) await adicionarModeloSupabase(m);
          
          // Recarregar
          return carregarConfiguracoes();
        } else {
           // Se nem localStorage tiver, salvar defaults
           console.log('Inicializando com padrões...');
           for (const m of defaultConfiguracoes.materiais) await adicionarMaterialSupabase(m);
           for (const c of defaultConfiguracoes.custosFixos) await adicionarCustoSupabase(c);
           for (const m of defaultConfiguracoes.modelos) await adicionarModeloSupabase(m);
           return carregarConfiguracoes();
        }
      }

      setConfiguracoes({
        materiais,
        custosFixos,
        modelos,
      });

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções internas para DB
  const adicionarMaterialSupabase = async (m: Material) => {
    await supabase.from('materiais').insert({
      id: m.id.includes('material_') ? undefined : m.id, // Deixar gerar UUID se for temp ID
      nome: m.nome,
      preco_por_kg: m.precoPorKg,
      cor: m.cor,
    });
  };
  
  const adicionarCustoSupabase = async (c: CustoFixo) => {
    await supabase.from('custos_fixos').insert({
      id: c.id.includes('custo_') ? undefined : c.id,
      descricao: c.descricao,
      valor: c.valor,
    });
  };

  const adicionarModeloSupabase = async (m: ModeloConfig) => {
    await supabase.from('modelos').insert({
      id: m.id.includes('modelo_') ? undefined : m.id,
      nome: m.nome,
      consumo_por_material: m.consumoPorMaterial,
      mao_obra_por_material: m.maoObraPorMaterial,
      custo_ferro: m.custoFerro,
    });
  };

  // Materiais
  const adicionarMaterial = async (material: Omit<Material, 'id'>) => {
    const novo = { ...material, id: 'temp' } as Material; // ID será gerado pelo banco
    // Otimistic
    setConfiguracoes(prev => ({ ...prev, materiais: [...prev.materiais, { ...material, id: 'temp_' + Date.now() }] }));
    
    const { error } = await supabase.from('materiais').insert({
      nome: material.nome,
      preco_por_kg: material.precoPorKg,
      cor: material.cor,
    });
    
    if (error) console.error(error);
    else carregarConfiguracoes();
  };

  const editarMaterial = async (id: string, materialAtualizado: Partial<Material>) => {
    // Otimistic
    setConfiguracoes(prev => ({
      ...prev,
      materiais: prev.materiais.map(m => m.id === id ? { ...m, ...materialAtualizado } : m)
    }));

    const payload: any = {};
    if (materialAtualizado.nome) payload.nome = materialAtualizado.nome;
    if (materialAtualizado.precoPorKg) payload.preco_por_kg = materialAtualizado.precoPorKg;
    if (materialAtualizado.cor) payload.cor = materialAtualizado.cor;

    const { error } = await supabase.from('materiais').update(payload).eq('id', id);
    if (error) console.error(error);
  };

  const removerMaterial = async (id: string) => {
    try {
      setConfiguracoes(prev => ({ ...prev, materiais: prev.materiais.filter(m => m.id !== id) }));
      const { error, count } = await supabase.from('materiais').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count === 0) throw new Error('Material não encontrado no servidor.');
    } catch (error: any) {
      console.error('Erro ao remover material:', error);
      alert(`Não foi possível remover o material: ${error.message}`);
      carregarConfiguracoes();
    }
  };

  // Custos Fixos
  const adicionarCustoFixo = async (custo: Omit<CustoFixo, 'id'>) => {
    setConfiguracoes(prev => ({ ...prev, custosFixos: [...prev.custosFixos, { ...custo, id: 'temp_' + Date.now() }] }));
    const { error } = await supabase.from('custos_fixos').insert({
      descricao: custo.descricao,
      valor: custo.valor,
    });
    if (!error) carregarConfiguracoes();
  };

  const editarCustoFixo = async (id: string, custoAtualizado: Partial<CustoFixo>) => {
    setConfiguracoes(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.map(c => c.id === id ? { ...c, ...custoAtualizado } : c)
    }));
    await supabase.from('custos_fixos').update(custoAtualizado).eq('id', id);
  };

  const removerCustoFixo = async (id: string) => {
    try {
      setConfiguracoes(prev => ({ ...prev, custosFixos: prev.custosFixos.filter(c => c.id !== id) }));
      const { error, count } = await supabase.from('custos_fixos').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count === 0) throw new Error('Custo fixo não encontrado no servidor.');
    } catch (error: any) {
      console.error('Erro ao remover custo fixo:', error);
      alert(`Não foi possível remover: ${error.message}`);
      carregarConfiguracoes();
    }
  };

  // Modelos
  const adicionarModelo = async (modelo: Omit<ModeloConfig, 'id'>) => {
    setConfiguracoes(prev => ({ ...prev, modelos: [...prev.modelos, { ...modelo, id: 'temp_' + Date.now() }] }));
    
    const { error } = await supabase.from('modelos').insert({
      nome: modelo.nome,
      consumo_por_material: modelo.consumoPorMaterial,
      mao_obra_por_material: modelo.maoObraPorMaterial,
      custo_ferro: modelo.custoFerro,
    });
    
    if (!error) carregarConfiguracoes();
  };

  const editarModelo = async (id: string, modeloAtualizado: Partial<ModeloConfig>) => {
    setConfiguracoes(prev => ({
      ...prev,
      modelos: prev.modelos.map(m => m.id === id ? { ...m, ...modeloAtualizado } : m)
    }));

    const payload: any = {};
    if (modeloAtualizado.nome) payload.nome = modeloAtualizado.nome;
    if (modeloAtualizado.consumoPorMaterial) payload.consumo_por_material = modeloAtualizado.consumoPorMaterial;
    if (modeloAtualizado.maoObraPorMaterial) payload.mao_obra_por_material = modeloAtualizado.maoObraPorMaterial;
    if (modeloAtualizado.custoFerro !== undefined) payload.custo_ferro = modeloAtualizado.custoFerro;

    await supabase.from('modelos').update(payload).eq('id', id);
  };

  const removerModelo = async (id: string) => {
    try {
      setConfiguracoes(prev => ({ ...prev, modelos: prev.modelos.filter(m => m.id !== id) }));
      const { error, count } = await supabase.from('modelos').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count === 0) throw new Error('Modelo não encontrado no servidor.');
    } catch (error: any) {
      console.error('Erro ao remover modelo:', error);
      alert(`Não foi possível remover o modelo: ${error.message}`);
      carregarConfiguracoes();
    }
  };

  const resetarConfiguracoes = async () => {
    // Implementar se necessário, deletando tudo e recriando
  };

  return {
    configuracoes,
    materiais: configuracoes.materiais,
    custosFixos: configuracoes.custosFixos,
    modelos: configuracoes.modelos,
    loading,
    adicionarMaterial,
    editarMaterial,
    removerMaterial,
    adicionarCustoFixo,
    editarCustoFixo,
    removerCustoFixo,
    adicionarModelo,
    editarModelo,
    removerModelo,
    resetarConfiguracoes,
    atualizarMaterial: editarMaterial,
    atualizarModelo: editarModelo,
  };
}