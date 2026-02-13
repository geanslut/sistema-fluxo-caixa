import React, { useState } from 'react';
import { Material, ModeloConfig, Venda, ItemVenda } from '../types';
import {
  calcularCustoOperacao,
  calcularMaoObra,
  calcularMargemExcedente,
  formatarMoeda,
} from '../utils/calculos';
import { X, Wrench, Hammer, CheckCircle2, ShoppingCart } from 'lucide-react';
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

interface FormularioVendaProps {
  onSalvar: (venda: Venda) => void;
  materiais: Material[];
  modelos: ModeloConfig[];
  custosFixos: { valor: number }[];
}

export function FormularioVenda({ onSalvar, materiais, modelos, custosFixos }: FormularioVendaProps) {
  const [tipoOperacao, setTipoOperacao] = useState<'reforma' | 'fabricacao' | null>(null);
  const [modeloId, setModeloId] = useState<string>(modelos[0]?.id || '');
  const [materialId, setMaterialId] = useState<string>(materiais[0]?.id || '');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [valorUnitario, setValorUnitario] = useState<string>('');
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleAdicionarAoCarrinho = () => {
    const valor = parseFloat(valorUnitario);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, insira um valor válido para a venda.');
      return;
    }

    if (quantidade <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    const modelo = modelos.find((m) => m.id === modeloId);
    const material = materiais.find((m) => m.id === materialId);

    if (!modelo || !material || !tipoOperacao) {
      alert('Erro: Modelo, Material ou Tipo de Operação não encontrado.');
      return;
    }

    const custoOperacaoBase = calcularCustoOperacao(modelo, material, custosFixos);
    const custoFerroUnitario = tipoOperacao === 'fabricacao' ? modelo.custoFerro : 0;
    const custoOperacaoTotal = custoOperacaoBase + custoFerroUnitario;
    const maoObraUnitario = calcularMaoObra(modelo, material);
    const margemExcedenteUnitaria = calcularMargemExcedente(valor, custoOperacaoTotal, maoObraUnitario);

    const item: ItemVenda = {
      modeloId,
      materialId,
      quantidade,
      valorUnitario: valor,
      valorTotal: valor * quantidade,
      custoOperacao: custoOperacaoTotal * quantidade,
      maoObra: maoObraUnitario * quantidade,
      margemExcedente: margemExcedenteUnitaria * quantidade,
      tipoOperacao,
      custoFerro: custoFerroUnitario * quantidade,
    };

    setCarrinho([...carrinho, item]);
    setShowConfirmModal(true);
    // Não limpar os campos para permitir adicionar mais itens facilmente
  };

  const handleFinalizarVenda = () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um item antes de finalizar.');
      return;
    }

    const totais = carrinho.reduce(
      (acc, item) => ({
        valorTotal: acc.valorTotal + item.valorTotal,
        custoOperacao: acc.custoOperacao + item.custoOperacao,
        maoObra: acc.maoObra + item.maoObra,
        margemExcedente: acc.margemExcedente + item.margemExcedente,
        custoFerro: acc.custoFerro + (item.custoFerro || 0),
      }),
      { valorTotal: 0, custoOperacao: 0, maoObra: 0, margemExcedente: 0, custoFerro: 0 }
    );

    if (totais.margemExcedente < 0) {
      if (
        !window.confirm(
          `Atenção! Esta venda terá margem negativa de ${formatarMoeda(
            totais.margemExcedente
          )}. Deseja continuar?`
        )
      ) {
        return;
      }
    }

    const venda: Venda = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      tipo: 'entrada',
      itens: carrinho,
      valorTotal: totais.valorTotal,
      custoOperacao: totais.custoOperacao,
      maoObra: totais.maoObra,
      margemExcedente: totais.margemExcedente,
      modeloId: carrinho[0].modeloId,
      materialId: carrinho[0].materialId,
      tipoOperacao: carrinho[0].tipoOperacao,
    };

    onSalvar(venda);
    setCarrinho([]);
    setValorUnitario('');
    setQuantidade(1);
    setTipoOperacao(null);
  };

  const totaisCarrinho = carrinho.reduce(
    (acc, item) => ({
      quantidade: acc.quantidade + item.quantidade,
      valorTotal: acc.valorTotal + item.valorTotal,
    }),
    { quantidade: 0, valorTotal: 0 }
  );

  const obterNomeModelo = (id: string) => modelos.find((m) => m.id === id)?.nome || '';
  const obterNomeMaterial = (id: string) => materiais.find((m) => m.id === id)?.nome || '';

  if (materiais.length === 0 || modelos.length === 0) {
    return (
      <div className="bg-[#243645] rounded-[34px] p-8 text-center">
        <p className="text-[#cecece] text-[15.251px]">
          Configure materiais e modelos primeiro na aba de Configurações.
        </p>
      </div>
    );
  }

  return (
    <div>
      {!tipoOperacao ? (
        <div className="bg-[#243645] rounded-[34px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white h-[33px] rounded-[15px] w-[3px]" />
            <h2 className="text-[22px] text-white font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
              Tipo de Operação
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipoOperacao('reforma')}
              className="bg-[#294c65] rounded-[22px] h-[108px] flex flex-col items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Wrench className="w-7 h-7 text-[#cecece]" strokeWidth={1.5} />
              <p className="text-[#cecece] text-[17px] font-light text-center leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Reforma
              </p>
            </button>
            <button
              type="button"
              onClick={() => setTipoOperacao('fabricacao')}
              className="bg-[#294c65] rounded-[22px] h-[108px] flex flex-col items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Hammer className="w-7 h-7 text-[#cecece]" strokeWidth={1.5} />
              <p className="text-[#cecece] text-[17px] font-light text-center leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Fabricação
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#243645] rounded-[34px] p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white h-[54px] rounded-[15px] w-[3px]" />
            <div>
              <h2 className="text-[22px] text-white font-normal leading-tight" style={{ fontVariationSettings: "'opsz' 14" }}>
                Adicionar Item à Venda
              </h2>
              <p className="text-[#cecece] text-[14px] font-light mt-1 leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Modelo do Produto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTipoOperacao(null)}
            className="mt-4 text-[#cecece] text-[13px] font-light hover:text-white transition-colors flex items-center gap-1"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            <X className="w-4 h-4" />
            Alterar tipo de operação
          </button>

          <div className="h-[1px] bg-white opacity-20 my-6" />

          {/* Modelos */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {modelos.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModeloId(m.id)}
                className={`rounded-[25.5px] h-[63px] flex items-center justify-center transition-all ${
                  modeloId === m.id ? 'bg-white' : 'bg-[#294c65]'
                }`}
              >
                <p
                  className={`text-[17px] font-light text-center px-3 leading-tight ${
                    modeloId === m.id ? 'text-[#243645]' : 'text-[#cecece]'
                  }`}
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {m.nome}
                </p>
              </button>
            ))}
          </div>

          {/* Quantidade */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white h-[33px] rounded-[15px] w-[3px]" />
              <h3 className="text-[22px] text-white font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Quantidade
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                className="bg-[#dadad5] rounded-[25.5px] size-[51px] flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <span className="text-[#243645] text-[28px] font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                  −
                </span>
              </button>
              <div className="flex-1 border border-[#dadad5] rounded-[20px] h-[51px] flex items-center justify-center">
                <p className="text-white text-[22px] font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                  {quantidade}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuantidade(quantidade + 1)}
                className="bg-[#dadad5] rounded-[25.5px] size-[51px] flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <span className="text-[#243645] text-[28px] font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                  +
                </span>
              </button>
            </div>
          </div>

          {/* Material */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white h-[33px] rounded-[15px] w-[3px]" />
              <h3 className="text-[22px] text-white font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Material Usado
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {materiais.map((mat) => (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setMaterialId(mat.id)}
                  className={`rounded-[25.5px] h-[51px] flex items-center justify-center transition-all ${
                    materialId === mat.id ? 'bg-white' : 'bg-[#294c65]'
                  }`}
                >
                  <p
                    className={`text-[17px] font-light text-center leading-none ${
                      materialId === mat.id ? 'text-[#243645]' : 'text-[#cecece]'
                    }`}
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    {mat.nome}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Valor Unitário */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white h-[33px] rounded-[15px] w-[3px]" />
              <h3 className="text-[22px] text-white font-normal leading-none" style={{ fontVariationSettings: "'opsz' 14" }}>
                Valor Unitário
              </h3>
            </div>
            <div className="border border-[#dadad5] rounded-[20px] h-[63px] px-4 flex items-center">
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                placeholder="R$ 0,00"
                className="w-full bg-transparent text-white text-[22px] font-normal outline-none placeholder:text-white placeholder:opacity-39"
                style={{ fontVariationSettings: "'opsz' 14" }}
              />
            </div>
          </div>

          {/* Botão Único */}
          <button
            type="button"
            onClick={handleAdicionarAoCarrinho}
            className="w-full bg-[#05df7d] hover:bg-[#04c56d] text-[#243645] rounded-[25.5px] h-[58px] font-bold text-[18px] mt-6 transition-all"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Adicionar ao Carrinho
          </button>
        </div>
      )}

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="bg-white rounded-xl">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-[#243645]">
              <CheckCircle2 className="w-6 h-6 text-[#05df7d]" />
              Confirmar Venda
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              O item foi adicionado ao carrinho. Deseja finalizar a venda agora ou continuar adicionando itens?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmModal(false);
                handleFinalizarVenda();
              }}
              className="w-full bg-[#05df7d] hover:bg-[#04c56d] text-[#243645] font-bold rounded-lg"
            >
              Finalizar Venda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}