import React, { useState } from 'react';
import { Configuracoes as ConfiguracoesType, Material, CustoFixo, ModeloConfig, Transacao } from '../types';
import { GerenciarMateriais } from './GerenciarMateriais';
import { GerenciarCustosFixos } from './GerenciarCustosFixos';
import { GerenciarModelos } from './GerenciarModelos';
import { Relatorios } from './Relatorios';
import { Package, DollarSign, Armchair, FileBarChart, Wallet, ArrowRight, Trash2, ShieldAlert } from 'lucide-react';

interface ConfiguracoesProps {
  configuracoes: ConfiguracoesType;
  transacoes: Transacao[];
  onAdicionarTransacao: (transacao: Transacao) => void;
  onAtualizarMaterial: (id: string, material: Partial<Material>) => void;
  onAtualizarModelo: (id: string, modelo: Partial<ModeloConfig>) => void;
  onAdicionarCustoFixo: (custo: Omit<CustoFixo, 'id'>) => void;
  onEditarCustoFixo: (id: string, custo: Omit<CustoFixo, 'id'>) => void;
  onRemoverCustoFixo: (id: string) => void;
  onAdicionarModelo: (modelo: Omit<ModeloConfig, 'id'>) => void;
  onAdicionarMaterial: (material: Omit<Material, 'id'>) => void;
  onRemoverMaterial?: (id: string) => void;
  onLimparDados: () => void;
}

export function Configuracoes({
  configuracoes,
  transacoes,
  onAdicionarTransacao,
  onAtualizarMaterial,
  onAtualizarModelo,
  onAdicionarCustoFixo,
  onEditarCustoFixo,
  onRemoverCustoFixo,
  onAdicionarModelo,
  onAdicionarMaterial,
  onRemoverMaterial,
  onLimparDados,
}: ConfiguracoesProps) {
  const [abaAtiva, setAbaAtiva] = useState<'materiais' | 'custos' | 'modelos' | 'relatorios' | 'financeiro' | 'sistema'>('financeiro');
  const [valorRetirada, setValorRetirada] = useState('');
  const [descricaoRetirada, setDescricaoRetirada] = useState('');

  const handleRetirada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorRetirada) return;

    const valor = parseFloat(valorRetirada.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Valor inválido');
      return;
    }

    const retirada: Transacao = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      descricao: descricaoRetirada || 'Retirada de Lucro',
      valor: valor,
      tipo: 'retirada'
    };

    onAdicionarTransacao(retirada);
    setValorRetirada('');
    setDescricaoRetirada('');
    alert('Retirada registrada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setAbaAtiva('financeiro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'financeiro'
              ? 'bg-[#243645] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Retirada de Lucro
        </button>
        <button
          onClick={() => setAbaAtiva('modelos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'modelos'
              ? 'bg-[#243645] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Armchair className="w-4 h-4" />
          Modelos
        </button>
        <button
          onClick={() => setAbaAtiva('materiais')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'materiais'
              ? 'bg-[#243645] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Materiais
        </button>
        <button
          onClick={() => setAbaAtiva('custos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'custos'
              ? 'bg-[#243645] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Custos Fixos
        </button>
        <button
          onClick={() => setAbaAtiva('relatorios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'relatorios'
              ? 'bg-[#243645] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          Relatórios
        </button>
        <button
          onClick={() => setAbaAtiva('sistema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            abaAtiva === 'sistema'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Sistema
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-6 shadow-sm">
        {abaAtiva === 'sistema' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-[#243645]">Área de Perigo</h2>
              <p className="text-gray-500 text-sm mt-1">Ações destrutivas e gerenciamento de dados</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Limpar Banco de Dados
                </h3>
                <p className="text-red-600 text-sm mb-4">
                  Esta ação irá apagar <strong>todas</strong> as transações registradas no sistema. 
                  Isso é útil caso haja erros de sincronização ou dados corrompidos que não podem ser excluídos individualmente.
                  <br /><br />
                  <strong>Esta ação é irreversível.</strong>
                </p>
                <button
                  onClick={onLimparDados}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Apagar Todas as Transações
                </button>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'relatorios' && (
          <Relatorios transacoes={transacoes} modelos={configuracoes.modelos} />
        )}

        {abaAtiva === 'financeiro' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-[#243645]">Retirada de Lucro</h2>
              <p className="text-gray-500 text-sm mt-1">Registre retiradas da renda disponível (mão de obra)</p>
            </div>

            <form onSubmit={handleRetirada} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Retirada</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorRetirada}
                    onChange={(e) => setValorRetirada(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#243645] text-lg font-semibold text-[#243645]"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={descricaoRetirada}
                  onChange={(e) => setDescricaoRetirada(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#243645]"
                  placeholder="Ex: Pagamento conta de luz casa"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#243645] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#1a2833] transition-colors flex items-center justify-center gap-2"
              >
                Confirmar Retirada
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {abaAtiva === 'materiais' && (
          <GerenciarMateriais
            materiais={configuracoes.materiais}
            onEditar={onAtualizarMaterial}
            onAdicionar={onAdicionarMaterial}
            onRemover={onRemoverMaterial}
          />
        )}

        {abaAtiva === 'custos' && (
          <GerenciarCustosFixos
            custosFixos={configuracoes.custosFixos}
            onAdicionar={onAdicionarCustoFixo}
            onEditar={onEditarCustoFixo}
            onRemover={onRemoverCustoFixo}
          />
        )}

        {abaAtiva === 'modelos' && (
          <GerenciarModelos
            modelos={configuracoes.modelos}
            materiais={configuracoes.materiais}
            onAdicionar={onAdicionarModelo}
            onEditar={onAtualizarModelo}
          />
        )}
      </div>
    </div>
  );
}