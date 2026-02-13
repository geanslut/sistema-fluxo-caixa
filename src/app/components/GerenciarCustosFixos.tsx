import React, { useState } from 'react';
import { CustoFixo } from '../types';
import { formatarMoeda } from '../utils/calculos';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
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

interface GerenciarCustosFixosProps {
  custosFixos: CustoFixo[];
  onAdicionar: (custo: Omit<CustoFixo, 'id'>) => void;
  onEditar: (id: string, custo: Omit<CustoFixo, 'id'>) => void;
  onRemover: (id: string) => void;
}

export function GerenciarCustosFixos({
  custosFixos,
  onAdicionar,
  onEditar,
  onRemover,
}: GerenciarCustosFixosProps) {
  const [adicionando, setAdicionando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoCusto, setNovoCusto] = useState({ descricao: '', valor: '' });
  const [custoEditando, setCustoEditando] = useState<{ descricao: string; valor: string } | null>(
    null
  );
  const [custoParaExcluir, setCustoParaExcluir] = useState<string | null>(null);

  const handleSubmitAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(novoCusto.valor);

    if (!novoCusto.descricao.trim()) {
      alert('Descrição é obrigatória.');
      return;
    }

    if (isNaN(valor) || valor < 0) {
      alert('Valor inválido.');
      return;
    }

    onAdicionar({ descricao: novoCusto.descricao, valor });
    setNovoCusto({ descricao: '', valor: '' });
    setAdicionando(false);
  };

  const handleSubmitEditar = (id: string) => {
    if (!custoEditando) return;

    const valor = parseFloat(custoEditando.valor);

    if (!custoEditando.descricao.trim()) {
      alert('Descrição é obrigatória.');
      return;
    }

    if (isNaN(valor) || valor < 0) {
      alert('Valor inválido.');
      return;
    }

    onEditar(id, { descricao: custoEditando.descricao, valor });
    setEditandoId(null);
    setCustoEditando(null);
  };

  const podeRemover = (id: string) => {
    // Não permitir remover a taxa de insumos (obrigatória)
    return id !== 'taxa_insumos';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-black to-gray-800 p-2.5 rounded-xl">
            <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold">Custos Fixos</h2>
        </div>
        <button
          onClick={() => setAdicionando(true)}
          className="p-2.5 bg-black hover:bg-gray-800 text-white rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Informação sobre custos fixos */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 font-semibold">
          💡 <strong>Taxa de Insumos:</strong> Custo fixo adicionado a cada venda (cola, verniz, etc.)
        </p>
      </div>

      {/* Lista de custos fixos */}
      <div className="space-y-3">
        {custosFixos.map((custo) => (
          <div
            key={custo.id}
            className="border-2 border-gray-200 rounded-xl p-4 hover:border-black transition-all bg-gradient-to-br from-white to-gray-50"
          >
            {editandoId === custo.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitEditar(custo.id);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={custoEditando?.descricao || ''}
                  onChange={(e) =>
                    setCustoEditando({ ...custoEditando!, descricao: e.target.value })
                  }
                  placeholder="Descrição"
                  className="w-full p-2 border-2 border-black rounded text-sm font-medium"
                  required
                  disabled={custo.id === 'taxa_insumos'} // Não permitir editar descrição da taxa obrigatória
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={custoEditando?.valor || ''}
                    onChange={(e) => setCustoEditando({ ...custoEditando!, valor: e.target.value })}
                    placeholder="0,00"
                    className="flex-1 p-2 border-2 border-black rounded text-sm font-bold"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-800 transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(null);
                      setCustoEditando(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-base mb-1">{custo.descricao}</p>
                  <p className="text-2xl font-black tabular-nums">{formatarMoeda(custo.valor)}</p>
                  {custo.id === 'taxa_insumos' && (
                    <p className="text-xs text-gray-500 mt-1">Custo obrigatório por produto</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditandoId(custo.id);
                      setCustoEditando({ descricao: custo.descricao, valor: custo.valor.toString() });
                    }}
                    className="p-2 hover:bg-gray-100 rounded transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {podeRemover(custo.id) && (
                    <button
                      onClick={() => setCustoParaExcluir(custo.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário de adicionar */}
      {adicionando && (
        <div className="mt-4 border-2 border-black rounded-xl p-4 bg-gray-50">
          <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">Adicionar Custo Fixo</h3>
          <form onSubmit={handleSubmitAdicionar} className="space-y-3">
            <input
              type="text"
              value={novoCusto.descricao}
              onChange={(e) => setNovoCusto({ ...novoCusto, descricao: e.target.value })}
              placeholder="Ex: Entrega, Embalagem, etc."
              className="w-full p-2 border-2 border-black rounded text-sm font-medium"
              required
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={novoCusto.valor}
                onChange={(e) => setNovoCusto({ ...novoCusto, valor: e.target.value })}
                placeholder="0,00"
                className="flex-1 p-2 border-2 border-black rounded text-sm font-bold"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-800 transition-all"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdicionando(false);
                  setNovoCusto({ descricao: '', valor: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <AlertDialog open={!!custoParaExcluir} onOpenChange={(open) => !open && setCustoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Custo Fixo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este custo fixo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (custoParaExcluir) {
                  onRemover(custoParaExcluir);
                  setCustoParaExcluir(null);
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