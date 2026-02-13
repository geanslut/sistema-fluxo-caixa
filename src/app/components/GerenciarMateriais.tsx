import React, { useState } from 'react';
import { Material } from '../types';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { formatarMoeda } from '../utils/calculos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface GerenciarMateriaisProps {
  materiais: Material[];
  onEditar: (id: string, material: Partial<Material>) => void;
  onAdicionar: (material: Omit<Material, 'id'>) => void;
  onRemover?: (id: string) => void;
}

export function GerenciarMateriais({ materiais, onEditar, onAdicionar, onRemover }: GerenciarMateriaisProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tempMaterial, setTempMaterial] = useState<Partial<Material>>({});
  const [materialParaExcluir, setMaterialParaExcluir] = useState<string | null>(null);
  
  // Estado para novo material
  const [adicionando, setAdicionando] = useState(false);
  const [novoMaterial, setNovoMaterial] = useState({ nome: '', precoPorKg: '', cor: '#000000' });

  const handleSubmitEditar = (id: string) => {
    if (tempMaterial.precoPorKg !== undefined && tempMaterial.precoPorKg < 0) {
      alert('Preço inválido.');
      return;
    }
    onEditar(id, tempMaterial);
    setEditandoId(null);
    setTempMaterial({});
  };

  const handleSubmitAdicionar = () => {
    if (!novoMaterial.nome.trim()) {
      alert('Nome do material é obrigatório.');
      return;
    }
    
    const preco = parseFloat(novoMaterial.precoPorKg);
    if (isNaN(preco) || preco < 0) {
      alert('Preço inválido.');
      return;
    }

    onAdicionar({
      nome: novoMaterial.nome,
      precoPorKg: preco,
      cor: novoMaterial.cor
    });

    setNovoMaterial({ nome: '', precoPorKg: '', cor: '#000000' });
    setAdicionando(false);
  };

  return (
    <div className="bg-white border border-[#535353] rounded-[34px] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white h-[33px] rounded-[15px] w-[3px]" />
          <h3 className="text-[20px] text-[#243645] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
            Gerenciar Materiais
          </h3>
        </div>
        
        {!adicionando && (
          <button
            onClick={() => setAdicionando(true)}
            className="bg-[#243645] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Adicionar Material
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Formulário de Adição */}
        {adicionando && (
          <div className="bg-[#f0f9ff] border border-blue-100 rounded-[20px] p-4 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-sm font-semibold text-[#243645] mb-3">Novo Material</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={novoMaterial.nome}
                onChange={(e) => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                className="w-full border border-blue-200 rounded-[15px] h-[51px] px-4 text-[#243645] text-[16px] font-normal outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ fontVariationSettings: "'opsz' 14" }}
                placeholder="Nome do material (ex: Junco)"
                autoFocus
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoMaterial.precoPorKg}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, precoPorKg: e.target.value })}
                  className="flex-1 border border-blue-200 rounded-[15px] h-[51px] px-4 text-[#243645] text-[16px] font-normal outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                  placeholder="Preço por kg"
                />
                <div className="w-[51px] h-[51px] relative">
                  <input
                    type="color"
                    value={novoMaterial.cor}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, cor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="w-full h-full rounded-[15px] border border-blue-200 flex items-center justify-center"
                    style={{ backgroundColor: novoMaterial.cor }}
                  >
                    <div className="bg-white/50 rounded-full p-1">
                      <Edit2 className="w-4 h-4 text-black/50" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSubmitAdicionar}
                  className="flex-1 bg-[#243645] text-white rounded-[15px] h-[51px] font-normal flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setAdicionando(false);
                    setNovoMaterial({ nome: '', precoPorKg: '', cor: '#000000' });
                  }}
                  className="flex-1 bg-white border border-[#535353] text-[#243645] rounded-[15px] h-[51px] font-normal flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {materiais.map((material) => {
          const editando = editandoId === material.id;

          return (
            <div key={material.id} className="bg-[#f5f5f5] rounded-[20px] p-4">
              {editando ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempMaterial.nome ?? material.nome}
                    onChange={(e) => setTempMaterial({ ...tempMaterial, nome: e.target.value })}
                    className="w-full border border-[#dadad5] rounded-[15px] h-[51px] px-4 text-[#243645] text-[16px] font-normal outline-none"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  />
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tempMaterial.precoPorKg ?? material.precoPorKg}
                      onChange={(e) =>
                        setTempMaterial({ ...tempMaterial, precoPorKg: parseFloat(e.target.value) })
                      }
                      className="flex-1 border border-[#dadad5] rounded-[15px] h-[51px] px-4 text-[#243645] text-[16px] font-normal outline-none"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                      placeholder="Preço por kg"
                    />
                     <div className="w-[51px] h-[51px] relative">
                      <input
                        type="color"
                        value={tempMaterial.cor ?? material.cor ?? '#000000'}
                        onChange={(e) => setTempMaterial({ ...tempMaterial, cor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="w-full h-full rounded-[15px] border border-[#dadad5] flex items-center justify-center"
                        style={{ backgroundColor: tempMaterial.cor ?? material.cor ?? '#000000' }}
                      >
                         <div className="bg-white/50 rounded-full p-1">
                          <Edit2 className="w-4 h-4 text-black/50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmitEditar(material.id)}
                      className="flex-1 bg-[#243645] text-white rounded-[15px] h-[51px] font-normal flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditandoId(null);
                        setTempMaterial({});
                      }}
                      className="flex-1 bg-white border border-[#535353] text-[#243645] rounded-[15px] h-[51px] font-normal flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full border border-black/10" 
                            style={{ backgroundColor: material.cor || '#000000' }}
                        />
                        <p className="font-normal text-[#243645] text-[18px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                        {material.nome}
                        </p>
                    </div>
                    <p className="font-light text-[#243645] text-[14px] opacity-60" style={{ fontVariationSettings: "'opsz' 14" }}>
                      {formatarMoeda(material.precoPorKg)}/kg
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                        setEditandoId(material.id);
                        setTempMaterial({ nome: material.nome, precoPorKg: material.precoPorKg, cor: material.cor });
                        }}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="w-5 h-5 text-[#243645]" />
                    </button>
                    {onRemover && (
                         <button
                         onClick={() => setMaterialParaExcluir(material.id)}
                         className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                         title="Remover"
                     >
                         <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                     </button>
                    )}
                   
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <AlertDialog open={!!materialParaExcluir} onOpenChange={(open) => !open && setMaterialParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Material</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este material? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (materialParaExcluir && onRemover) {
                  onRemover(materialParaExcluir);
                  setMaterialParaExcluir(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}