import React, { useState } from 'react';
import { ModeloConfig, Material } from '../types';
import { Edit2, Save, X, Plus } from 'lucide-react';
import { formatarMoeda } from '../utils/calculos';

interface GerenciarModelosProps {
  modelos: ModeloConfig[];
  materiais: Material[];
  onEditar: (id: string, modelo: Partial<ModeloConfig>) => void;
  onAdicionar: (modelo: Omit<ModeloConfig, 'id'>) => void;
}

export function GerenciarModelos({
  modelos,
  materiais,
  onEditar,
  onAdicionar,
}: GerenciarModelosProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estado para editar modelo existente
  const [modeloEditando, setModeloEditando] = useState<{
    nome: string;
    consumo: { [key: string]: string };
    maoObra: { [key: string]: string };
    custoFerro: string;
  } | null>(null);

  const handleSubmitEditar = (id: string) => {
    if (!modeloEditando) return;

    if (!modeloEditando.nome.trim()) {
      alert('Nome do modelo é obrigatório.');
      return;
    }

    const consumoPorMaterial: { [key: string]: number } = {};
    const maoObraPorMaterial: { [key: string]: number } = {};

    for (const material of materiais) {
      const consumo = parseFloat(modeloEditando.consumo[material.id] || '0');
      const maoObra = parseFloat(modeloEditando.maoObra[material.id] || '0');

      if (isNaN(consumo) || consumo < 0) {
        alert(`Consumo inválido para ${material.nome}.`);
        return;
      }
      if (isNaN(maoObra) || maoObra < 0) {
        alert(`Mão de obra inválida para ${material.nome}.`);
        return;
      }

      consumoPorMaterial[material.id] = consumo;
      maoObraPorMaterial[material.id] = maoObra;
    }

    const custoFerro = parseFloat(modeloEditando.custoFerro || '0');
    if (isNaN(custoFerro) || custoFerro < 0) {
      alert('Custo do ferro inválido.');
      return;
    }

    onEditar(id, {
      nome: modeloEditando.nome,
      consumoPorMaterial,
      maoObraPorMaterial,
      custoFerro,
    });

    setEditandoId(null);
    setModeloEditando(null);
  };

  const handleSubmitAdicionar = () => {
    if (!novoModelo.nome.trim()) {
      alert('Nome do modelo é obrigatório.');
      return;
    }

    const consumoPorMaterial: { [key: string]: number } = {};
    const maoObraPorMaterial: { [key: string]: number } = {};

    for (const material of materiais) {
      const consumo = parseFloat(novoModelo.consumo[material.id] || '0');
      const maoObra = parseFloat(novoModelo.maoObra[material.id] || '0');

      if (isNaN(consumo) || consumo < 0) {
        alert(`Consumo inválido para ${material.nome}.`);
        return;
      }
      if (isNaN(maoObra) || maoObra < 0) {
        alert(`Mão de obra inválida para ${material.nome}.`);
        return;
      }

      consumoPorMaterial[material.id] = consumo;
      maoObraPorMaterial[material.id] = maoObra;
    }

    const custoFerro = parseFloat(novoModelo.custoFerro || '0');
    if (isNaN(custoFerro) || custoFerro < 0) {
      alert('Custo do ferro inválido.');
      return;
    }

    onAdicionar({
      nome: novoModelo.nome,
      consumoPorMaterial,
      maoObraPorMaterial,
      custoFerro,
    });

    // Resetar formulário
    setNovoModelo({
      nome: '',
      consumo: {},
      maoObra: {},
      custoFerro: '0',
    });
    setAdicionando(false);
  };

  const [adicionando, setAdicionando] = useState(false);
  const [novoModelo, setNovoModelo] = useState<{
    nome: string;
    consumo: { [key: string]: string };
    maoObra: { [key: string]: string };
    custoFerro: string;
  }>({
    nome: '',
    consumo: {},
    maoObra: {},
    custoFerro: '0',
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h3 className="text-xl font-bold text-[#243645] tracking-tight">Catálogo de Modelos</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Gerencie seus produtos e custos</p>
        </div>
        {!adicionando && materiais.length > 0 && (
          <button
            onClick={() => setAdicionando(true)}
            className="bg-[#243645] text-white px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg shadow-[#243645]/20 hover:bg-[#1a2832] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        )}
      </div>

      {materiais.length === 0 && (
        <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Cadastre materiais primeiro antes de adicionar modelos.
          </p>
        </div>
      )}

      {/* Formulário de Adicionar Novo Modelo */}
      {adicionando && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xl shadow-gray-100/50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-bold text-[#243645]">Novo Modelo</h4>
            <button 
              onClick={() => {
                setAdicionando(false);
                setNovoModelo({ nome: '', consumo: {}, maoObra: {}, custoFerro: '0' });
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block pl-1">Nome do Modelo</label>
              <input
                type="text"
                value={novoModelo.nome}
                onChange={(e) => setNovoModelo({ ...novoModelo, nome: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl font-semibold text-[#243645] focus:outline-none focus:ring-2 focus:ring-[#243645]/20 focus:border-[#243645] transition-all placeholder:font-normal"
                placeholder="Ex: Cadeira de Escritório"
              />
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                Consumo (KG)
              </h5>
              <div className="space-y-3">
                {materiais.map((material) => (
                  <div key={material.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm ring-1 ring-gray-100"
                      style={{ backgroundColor: material.cor }}
                    />
                    <label className="text-sm font-medium text-gray-700 flex-1 truncate">{material.nome}</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoModelo.consumo[material.id] || '0'}
                        onChange={(e) =>
                          setNovoModelo({
                            ...novoModelo,
                            consumo: { ...novoModelo.consumo, [material.id]: e.target.value },
                          })
                        }
                        className="w-24 p-2 pr-8 bg-white border border-gray-200 rounded-xl text-right text-sm font-semibold focus:outline-none focus:border-[#243645] transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                Mão de Obra (R$)
              </h5>
              <div className="space-y-3">
                {materiais.map((material) => (
                  <div key={material.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm ring-1 ring-gray-100"
                      style={{ backgroundColor: material.cor }}
                    />
                    <label className="text-sm font-medium text-gray-700 flex-1 truncate">{material.nome}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoModelo.maoObra[material.id] || '0'}
                        onChange={(e) =>
                          setNovoModelo({
                            ...novoModelo,
                            maoObra: { ...novoModelo.maoObra, [material.id]: e.target.value },
                          })
                        }
                        className="w-24 p-2 pl-8 bg-white border border-gray-200 rounded-xl text-right text-sm font-semibold focus:outline-none focus:border-[#243645] transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                Custo do Ferro
              </h5>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Valor para fabricação</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoModelo.custoFerro || '0'}
                    onChange={(e) => setNovoModelo({ ...novoModelo, custoFerro: e.target.value })}
                    className="w-32 p-2 pl-8 bg-white border border-gray-200 rounded-xl text-right text-sm font-semibold focus:outline-none focus:border-[#243645] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitAdicionar}
              className="w-full bg-[#243645] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-wide shadow-lg shadow-[#243645]/20 hover:bg-[#1a2832] transition-all active:scale-[0.98]"
            >
              Confirmar Cadastro
            </button>
          </div>
        </div>
      )}

      {/* Lista de Modelos */}
      <div className="grid grid-cols-1 gap-4">
        {modelos.map((modelo) => {
          const editando = editandoId === modelo.id;

          if (editando && modeloEditando) {
            return (
              <div key={modelo.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xl shadow-gray-100/50">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-bold text-[#243645]">Editar Modelo</h4>
                  <button 
                    onClick={() => {
                      setEditandoId(null);
                      setModeloEditando(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block pl-1">Nome</label>
                    <input
                      type="text"
                      value={modeloEditando.nome}
                      onChange={(e) => setModeloEditando({ ...modeloEditando, nome: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl font-semibold text-[#243645] focus:outline-none focus:ring-2 focus:ring-[#243645]/20 focus:border-[#243645]"
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Consumo */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Consumo (KG)</h5>
                      <div className="space-y-2">
                        {materiais.map((material) => (
                          <div key={material.id} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: material.cor }} />
                            <label className="text-sm text-gray-600 flex-1">{material.nome}</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={modeloEditando.consumo[material.id] || '0'}
                                onChange={(e) =>
                                  setModeloEditando({
                                    ...modeloEditando,
                                    consumo: { ...modeloEditando.consumo, [material.id]: e.target.value },
                                  })
                                }
                                className="w-20 p-1.5 pr-6 bg-white border border-gray-200 rounded-lg text-right text-sm font-medium focus:outline-none focus:border-[#243645]"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">kg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mão de Obra */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Mão de Obra</h5>
                      <div className="space-y-2">
                        {materiais.map((material) => (
                          <div key={material.id} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: material.cor }} />
                            <label className="text-sm text-gray-600 flex-1">{material.nome}</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                              <input
                                type="number"
                                value={modeloEditando.maoObra[material.id] || '0'}
                                onChange={(e) =>
                                  setModeloEditando({
                                    ...modeloEditando,
                                    maoObra: { ...modeloEditando.maoObra, [material.id]: e.target.value },
                                  })
                                }
                                className="w-20 p-1.5 pl-6 bg-white border border-gray-200 rounded-lg text-right text-sm font-medium focus:outline-none focus:border-[#243645]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ferro */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custo Ferro</h5>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                        <input
                          type="number"
                          value={modeloEditando.custoFerro || '0'}
                          onChange={(e) => setModeloEditando({ ...modeloEditando, custoFerro: e.target.value })}
                          className="w-24 p-1.5 pl-6 bg-white border border-gray-200 rounded-lg text-right text-sm font-medium focus:outline-none focus:border-[#243645]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmitEditar(modelo.id)}
                    className="w-full bg-[#243645] text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-[#1a2832] transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={modelo.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#243645]/5 flex items-center justify-center text-[#243645]">
                    <span className="font-bold text-lg">{modelo.nome.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#243645] text-lg leading-tight">{modelo.nome}</h4>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Modelo</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditandoId(modelo.id);
                    const consumo: { [key: string]: string } = {};
                    const maoObra: { [key: string]: string } = {};
                    materiais.forEach((m) => {
                      consumo[m.id] = (modelo.consumoPorMaterial[m.id] || 0).toString();
                      maoObra[m.id] = (modelo.maoObraPorMaterial[m.id] || 0).toString();
                    });
                    setModeloEditando({ nome: modelo.nome, consumo, maoObra, custoFerro: modelo.custoFerro.toString() });
                  }}
                  className="w-8 h-8 rounded-full bg-gray-50 hover:bg-[#243645] hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <div className="bg-gray-50/80 rounded-2xl p-3 space-y-2">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div> Consumo
                  </h5>
                  {materiais.map((material) => (
                    <div key={material.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium truncate pr-2">{material.nome}</span>
                      <span className="font-bold text-[#243645]">{modelo.consumoPorMaterial[material.id] || 0}kg</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-3 space-y-2">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-400"></div> Mão de Obra
                  </h5>
                  {materiais.map((material) => (
                    <div key={material.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium truncate pr-2">{material.nome}</span>
                      <span className="font-bold text-[#243645]">{formatarMoeda(modelo.maoObraPorMaterial[material.id] || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#243645]/5 rounded-xl p-3 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#243645]"></div>
                  <span className="text-xs font-semibold text-[#243645] opacity-80">Custo Ferro</span>
                </div>
                <span className="text-sm font-bold text-[#243645]">
                  {formatarMoeda(modelo.custoFerro)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}