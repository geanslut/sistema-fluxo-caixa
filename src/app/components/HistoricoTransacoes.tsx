import React from 'react';
import { History, TrendingUp, TrendingDown, Wrench, Hammer } from 'lucide-react';
import { Transacao, Material, ModeloConfig } from '../types';
import { formatarMoeda } from '../utils/calculos';

interface HistoricoTransacoesProps {
  transacoes: Transacao[];
  materiais: Material[];
  modelos: ModeloConfig[];
}

export function HistoricoTransacoes({ transacoes, materiais, modelos }: HistoricoTransacoesProps) {
  const formatarData = (isoString: string) => {
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obterNomeMaterial = (materialId: string) => {
    const material = materiais.find((m) => m.id === materialId);
    return material ? material.nome : 'Material removido';
  };

  const obterNomeModelo = (modeloId: string) => {
    const modelo = modelos.find((m) => m.id === modeloId);
    return modelo ? modelo.nome : 'Modelo removido';
  };

  const obterCorMaterial = (materialId: string) => {
    const material = materiais.find((m) => m.id === materialId);
    return material ? material.cor : '#000000';
  };

  if (transacoes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 text-center shadow-xl border border-gray-200">
        <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-gray-400" strokeWidth={2} />
        </div>
        <p className="text-gray-600 font-semibold text-lg">Nenhuma transação registrada ainda.</p>
        <p className="text-gray-500 text-sm mt-2">Suas transações aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-black to-gray-800 p-2.5 rounded-xl">
          <History className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold">Histórico de Transações</h2>
        <span className="ml-auto bg-gray-100 px-3 py-1 rounded-full text-sm font-bold text-gray-600">
          {transacoes.length}
        </span>
      </div>

      <div className="space-y-3">
        {transacoes.map((transacao) => (
          <div
            key={transacao.id}
            className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-black hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${transacao.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transacao.tipo === 'entrada' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-600" strokeWidth={2.5} />
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {transacao.tipo === 'entrada' ? 'Venda' : 'Despesa'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{formatarData(transacao.data)}</span>
                </div>

                {transacao.tipo === 'entrada' ? (
                  <>
                    {/* Se tiver múltiplos itens, mostrar lista */}
                    {transacao.itens && transacao.itens.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-sm text-gray-500">
                            Venda com {transacao.itens.length} {transacao.itens.length === 1 ? 'item' : 'itens'}:
                          </p>
                          {transacao.tipoOperacao && (
                            <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                              transacao.tipoOperacao === 'reforma' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {transacao.tipoOperacao === 'reforma' ? (
                                <>
                                  <Wrench className="w-3 h-3" strokeWidth={2.5} />
                                  REFORMA
                                </>
                              ) : (
                                <>
                                  <Hammer className="w-3 h-3" strokeWidth={2.5} />
                                  FABRICAÇÃO
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {transacao.itens.map((item, idx) => (
                          <div key={idx} className="pl-3 border-l-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: obterCorMaterial(item.materialId) }}
                              />
                              <p className="font-semibold text-sm break-words">
                                {item.quantidade}x {obterNomeModelo(item.modeloId)} - {obterNomeMaterial(item.materialId)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatarMoeda(item.valorUnitario)} cada = {formatarMoeda(item.valorTotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="font-bold text-base break-words">
                            {obterNomeModelo(transacao.modeloId)} - {obterNomeMaterial(transacao.materialId)}
                          </p>
                          {transacao.tipoOperacao && (
                            <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                              transacao.tipoOperacao === 'reforma' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {transacao.tipoOperacao === 'reforma' ? (
                                <>
                                  <Wrench className="w-3 h-3" strokeWidth={2.5} />
                                  REFORMA
                                </>
                              ) : (
                                <>
                                  <Hammer className="w-3 h-3" strokeWidth={2.5} />
                                  FABR.
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs mt-3">
                      <div className="bg-white p-2 sm:p-2.5 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block mb-1 text-xs">Custo Op.</span>
                        <span className="font-bold text-xs sm:text-sm tabular-nums">
                          {formatarMoeda(transacao.custoOperacao)}
                        </span>
                      </div>
                      <div className="bg-white p-2 sm:p-2.5 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block mb-1 text-xs">Mão de Obra</span>
                        <span className="font-bold text-xs sm:text-sm tabular-nums">
                          {formatarMoeda(transacao.maoObra)}
                        </span>
                      </div>
                      <div className={`col-span-2 p-2 sm:p-2.5 rounded-lg border ${
                        transacao.margemExcedente < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}>
                        <span className={`block mb-1 font-semibold text-xs ${
                          transacao.margemExcedente < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Margem Excedente
                        </span>
                        <span
                          className={`font-bold text-xs sm:text-sm tabular-nums ${
                            transacao.margemExcedente < 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {formatarMoeda(transacao.margemExcedente)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Se tiver múltiplos itens de despesa, mostrar lista */}
                    {transacao.itens && transacao.itens.length > 0 ? (
                      <div className="space-y-2">
                        <p className="font-bold text-sm text-gray-500 mb-2">
                          Despesa com {transacao.itens.length} {transacao.itens.length === 1 ? 'item' : 'itens'}:
                        </p>
                        {transacao.itens.map((item, idx) => (
                          <div key={idx} className="pl-3 border-l-2 border-gray-200">
                            <p className="font-semibold text-sm break-words">{item.descricao}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantidade}x {formatarMoeda(item.valorUnitario)} = {formatarMoeda(item.valorTotal)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                              {item.categoria}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-base mb-1 break-words">{transacao.descricao}</p>
                        <p className="text-xs text-gray-500 capitalize bg-gray-100 inline-block px-2 py-1 rounded">
                          {transacao.categoria}
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="text-right sm:text-right flex-shrink-0">
                <p
                  className={`text-xl sm:text-2xl font-black tabular-nums ${
                    transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transacao.tipo === 'saida' && '−'}
                  {transacao.tipo === 'entrada' && '+'}
                  {formatarMoeda(transacao.tipo === 'entrada' ? transacao.valorTotal : transacao.valor).replace('R$', '').trim()}
                </p>
                <p className="text-xs text-gray-400 mt-1">R$</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}