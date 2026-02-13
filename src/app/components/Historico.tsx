import React, { useState } from 'react';
import { Transacao, ModeloConfig, Material } from '../types';
import { formatarMoeda } from '../utils/calculos';
import { Trash2, Wrench, Hammer, TrendingUp, DollarSign, Wallet, ArrowUpRight, ChevronDown, ChevronUp, ArrowDownLeft } from 'lucide-react';
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

interface HistoricoProps {
  transacoes: Transacao[];
  modelos: ModeloConfig[];
  materiais: Material[];
  onRemover: (id: string) => void;
}

export function Historico({ transacoes, modelos, materiais, onRemover }: HistoricoProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null);
  
  const obterNomeModelo = (id: string) => modelos.find((m) => m.id === id)?.nome || 'Desconhecido';
  const obterNomeMaterial = (id: string) => materiais.find((m) => m.id === id)?.nome || 'Desconhecido';

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (transacoes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-[#dadad5] rounded-[34px] p-12 text-center min-h-[240px] flex flex-col items-center justify-center">
        <div className="bg-[#f5f5f5] rounded-full p-4 mb-4">
          <Wallet className="w-8 h-8 text-[#243645] opacity-40" strokeWidth={1.5} />
        </div>
        <p className="font-normal text-[#243645] text-[18px] mb-2" style={{ fontVariationSettings: "'opsz' 14" }}>
          Nenhuma transação registrada
        </p>
        <p className="font-light text-[#243645] text-[14px] opacity-60" style={{ fontVariationSettings: "'opsz' 14" }}>
          Comece registrando sua primeira venda ou despesa
        </p>
      </div>
    );
  }

  // Ordenar e agrupar transações
  const transacoesOrdenadas = [...transacoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const grupos = transacoesOrdenadas.reduce((acc, transacao) => {
    const data = new Date(transacao.data);
    const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const titulo = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);
    
    const ultimoGrupo = acc[acc.length - 1];
    
    if (ultimoGrupo && ultimoGrupo.titulo === titulo) {
      ultimoGrupo.transacoes.push(transacao);
    } else {
      acc.push({ titulo, transacoes: [transacao] });
    }
    
    return acc;
  }, [] as { titulo: string, transacoes: Transacao[] }[]);

  return (
    <div className="space-y-8">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="space-y-3">
          <h3 className="text-[#243645] font-semibold text-lg ml-1 sticky top-0 bg-[#f8f9fa] z-10 py-2">
            {grupo.titulo}
          </h3>
          
          {grupo.transacoes.map((transacao) => {
            const isEntrada = transacao.tipo === 'entrada';
            const isRetirada = transacao.tipo === 'retirada';
            const isReforma = isEntrada && transacao.tipoOperacao === 'reforma';
            const isExpanded = expandedIds.has(transacao.id);
            
            // Definição de cores e ícones baseados no tipo
            let bgHeaderClass = '';
            let iconBgClass = '';
            let valorColorClass = '';
            let IconComponent;

            if (isEntrada) {
              bgHeaderClass = 'bg-gradient-to-r from-emerald-50 to-green-50';
              iconBgClass = 'bg-emerald-500';
              valorColorClass = 'text-emerald-600';
              IconComponent = isReforma ? Wrench : Hammer;
            } else if (isRetirada) {
              bgHeaderClass = 'bg-gradient-to-r from-blue-50 to-indigo-50';
              iconBgClass = 'bg-blue-500';
              valorColorClass = 'text-blue-600';
              IconComponent = ArrowDownLeft; // Ícone de retirada/saque
            } else {
              // Despesa
              bgHeaderClass = 'bg-gradient-to-r from-red-50 to-orange-50';
              iconBgClass = 'bg-red-500';
              valorColorClass = 'text-red-600';
              IconComponent = TrendingUp; // Rotacionado 180 abaixo
            }
            
            return (
              <div
                key={transacao.id}
                className="bg-white border border-[#e5e5e5] rounded-[24px] overflow-hidden hover:shadow-md hover:border-[#243645] transition-all duration-300 group"
              >
                {/* Header Compacto */}
                <div className={`px-4 py-3 ${bgHeaderClass}`}>
                  <div className="flex items-center justify-between gap-3">
                    {/* Ícone e Info */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`rounded-full p-2 flex-shrink-0 ${iconBgClass}`}>
                        {(!isEntrada && !isRetirada) ? (
                          <IconComponent className="w-4 h-4 text-white rotate-180" strokeWidth={2} />
                        ) : (
                          <IconComponent className="w-4 h-4 text-white" strokeWidth={2} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[#243645] text-[15px] leading-tight truncate" style={{ fontVariationSettings: "'opsz' 14" }}>
                            {isEntrada
                              ? obterNomeModelo(transacao.modeloId)
                              : transacao.descricao || (isRetirada ? 'Retirada de Lucro' : 'Despesa')}
                          </h3>
                          {isEntrada && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                              isReforma ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`} style={{ fontVariationSettings: "'opsz' 14" }}>
                              {isReforma ? 'Reforma' : 'Fabricação'}
                            </span>
                          )}
                          {isRetirada && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap bg-blue-100 text-blue-700" style={{ fontVariationSettings: "'opsz' 14" }}>
                              Retirada
                            </span>
                          )}
                        </div>
                        <p className="font-light text-[#243645] text-[11px] opacity-60 truncate" style={{ fontVariationSettings: "'opsz' 14" }}>
                          {isEntrada ? `${obterNomeMaterial(transacao.materialId)} • ` : ''}
                          {new Date(transacao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Valor e Ações */}
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-[20px] leading-none whitespace-nowrap ${valorColorClass}`} style={{ fontVariationSettings: "'opsz' 14" }}>
                        {isEntrada ? '+' : '-'}{formatarMoeda(isEntrada ? transacao.valorTotal : transacao.valor)}
                      </p>

                      <div className="flex items-center gap-1">
                        {isEntrada && (
                          <button
                            onClick={() => toggleExpanded(transacao.id)}
                            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                            title={isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#243645]" strokeWidth={2} />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#243645]" strokeWidth={2} />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => setTransacaoParaExcluir(transacao.id)}
                          className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos (apenas para entradas) */}
                {isEntrada && isExpanded && (() => {
                  // Verificar se a transação tem itens (vendas com carrinho)
                  const temItens = transacao.itens && transacao.itens.length > 0;
                  
                  if (temItens) {
                    // Calcular totais baseados nos itens do carrinho
                    const quantidadeTotal = transacao.itens!.reduce((acc, item) => acc + item.quantidade, 0);
                    
                    // Calcular custos detalhados
                    let custoMaterialTotal = 0;
                    let custoFerroTotal = 0;
                    let custoFixosTotal = 0;
                    
                    transacao.itens!.forEach(item => {
                      const modelo = modelos.find(m => m.id === item.modeloId);
                      const material = materiais.find(m => m.id === item.materialId);
                      const consumoUnitario = modelo?.consumoPorMaterial[item.materialId] || 0;
                      const custoMaterialUnitario = material ? consumoUnitario * material.precoPorKg : 0;
                      
                      custoMaterialTotal += custoMaterialUnitario * item.quantidade;
                      custoFerroTotal += (item.custoFerro || 0);
                    });
                    
                    custoFixosTotal = transacao.custoOperacao - custoMaterialTotal - custoFerroTotal;
                    
                    return (
                      <div className="px-4 py-3 bg-gray-50/50 border-t border-[#e5e5e5]">
                        {/* Info da Venda */}
                        <div className="mb-3 pb-2 border-b border-[#e5e5e5]">
                          <p className="font-medium text-[#243645] text-[11px] uppercase tracking-wide mb-1.5" style={{ fontVariationSettings: "'opsz' 14" }}>
                            Informações da Venda
                          </p>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                              Quantidade Total
                            </span>
                            <span className="font-bold text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                              {quantidadeTotal} {quantidadeTotal === 1 ? 'unidade' : 'unidades'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Breakdown de Custos */}
                        <div className="mb-3 pb-3 border-b border-[#e5e5e5]">
                          <p className="font-medium text-[#243645] text-[11px] uppercase tracking-wide mb-2" style={{ fontVariationSettings: "'opsz' 14" }}>
                            Detalhamento dos Custos
                          </p>
                          <div className="space-y-1.5">
                            {/* Material */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Material ({quantidadeTotal}x)
                              </span>
                              <span className="font-semibold text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(custoMaterialTotal)}
                              </span>
                            </div>
                            
                            {/* Custos Fixos */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Custos Fixos (insumos + taxas)
                              </span>
                              <span className="font-semibold text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(custoFixosTotal)}
                              </span>
                            </div>
                            
                            {/* Ferro (só para fabricação) */}
                            {!isReforma && custoFerroTotal > 0 && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                  Ferro para fabricação ({quantidadeTotal}x)
                                </span>
                                <span className="font-semibold text-purple-600" style={{ fontVariationSettings: "'opsz' 14" }}>
                                  {formatarMoeda(custoFerroTotal)}
                                </span>
                              </div>
                            )}
                            
                            {/* Mão de Obra */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Mão de Obra ({quantidadeTotal}x)
                              </span>
                              <span className="font-semibold text-[#294c65]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(transacao.maoObra)}
                              </span>
                            </div>
                            
                            {/* Total de Custos */}
                            <div className="flex items-center justify-between text-[12px] pt-1.5 border-t border-[#e5e5e5]">
                              <span className="font-medium text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Total de Custos
                              </span>
                              <span className="font-bold text-red-600" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(transacao.custoOperacao + transacao.maoObra)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Cards dos Saldos */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Capital de Giro */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-[#243645] rounded-lg p-1">
                                <DollarSign className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Capital de Giro
                              </p>
                            </div>
                            <p className="font-bold text-[#243645] text-[16px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.custoOperacao)}
                            </p>
                          </div>

                          {/* Renda Disponível */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-[#294c65] rounded-lg p-1">
                                <ArrowUpRight className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Renda Disponível
                              </p>
                            </div>
                            <p className="font-bold text-[#243645] text-[16px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.maoObra)}
                            </p>
                          </div>

                          {/* Fundo de Reserva */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-emerald-500 rounded-lg p-1">
                                <Wallet className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Fundo de Reserva
                              </p>
                            </div>
                            <p className={`font-bold text-[16px] ${
                              transacao.margemExcedente >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`} style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.margemExcedente)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Transação sem itens (formato antigo) - calcular da forma antiga
                    const modelo = modelos.find(m => m.id === transacao.modeloId);
                    const material = materiais.find(m => m.id === transacao.materialId);
                    const consumo = modelo?.consumoPorMaterial[transacao.materialId] || 0;
                    const custoMaterial = material ? consumo * material.precoPorKg : 0;
                    const custoFerro = transacao.custoFerro || 0;
                    const custoFixosTotal = transacao.custoOperacao - custoMaterial - custoFerro;
                    
                    return (
                      <div className="px-4 py-3 bg-gray-50/50 border-t border-[#e5e5e5]">
                        {/* Breakdown de Custos */}
                        <div className="mb-3 pb-3 border-b border-[#e5e5e5]">
                          <p className="font-medium text-[#243645] text-[11px] uppercase tracking-wide mb-2" style={{ fontVariationSettings: "'opsz' 14" }}>
                            Detalhamento dos Custos
                          </p>
                          <div className="space-y-1.5">
                            {/* Material */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Material ({consumo}kg × {formatarMoeda(material?.precoPorKg || 0)})
                              </span>
                              <span className="font-semibold text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(custoMaterial)}
                              </span>
                            </div>
                            
                            {/* Custos Fixos */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Custos Fixos (insumos + taxas)
                              </span>
                              <span className="font-semibold text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(custoFixosTotal)}
                              </span>
                            </div>
                            
                            {/* Ferro (só para fabricação) */}
                            {!isReforma && custoFerro > 0 && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                  Ferro para fabricação
                                </span>
                                <span className="font-semibold text-purple-600" style={{ fontVariationSettings: "'opsz' 14" }}>
                                  {formatarMoeda(custoFerro)}
                                </span>
                              </div>
                            )}
                            
                            {/* Mão de Obra */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#243645] opacity-70" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Mão de Obra
                              </span>
                              <span className="font-semibold text-[#294c65]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(transacao.maoObra)}
                              </span>
                            </div>
                            
                            {/* Total de Custos */}
                            <div className="flex items-center justify-between text-[12px] pt-1.5 border-t border-[#e5e5e5]">
                              <span className="font-medium text-[#243645]" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Total de Custos
                              </span>
                              <span className="font-bold text-red-600" style={{ fontVariationSettings: "'opsz' 14" }}>
                                {formatarMoeda(transacao.custoOperacao + transacao.maoObra)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Cards dos Saldos */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Capital de Giro */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-[#243645] rounded-lg p-1">
                                <DollarSign className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Capital de Giro
                              </p>
                            </div>
                            <p className="font-bold text-[#243645] text-[16px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.custoOperacao)}
                            </p>
                          </div>

                          {/* Renda Disponível */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-[#294c65] rounded-lg p-1">
                                <ArrowUpRight className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Renda Disponível
                              </p>
                            </div>
                            <p className="font-bold text-[#243645] text-[16px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.maoObra)}
                            </p>
                          </div>

                          {/* Fundo de Reserva */}
                          <div className="bg-white rounded-[16px] p-3 border border-[#e5e5e5]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="bg-emerald-500 rounded-lg p-1">
                                <Wallet className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <p className="font-light text-[#243645] text-[10px] uppercase tracking-wide" style={{ fontVariationSettings: "'opsz' 14" }}>
                                Fundo de Reserva
                              </p>
                            </div>
                            <p className={`font-bold text-[16px] ${
                              transacao.margemExcedente >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`} style={{ fontVariationSettings: "'opsz' 14" }}>
                              {formatarMoeda(transacao.margemExcedente)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            );
          })}
        </div>
      ))}
      
      <AlertDialog open={!!transacaoParaExcluir} onOpenChange={(open) => !open && setTransacaoParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (transacaoParaExcluir) {
                  onRemover(transacaoParaExcluir);
                  setTransacaoParaExcluir(null);
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