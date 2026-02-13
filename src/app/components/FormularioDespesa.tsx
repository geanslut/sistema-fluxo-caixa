import React, { useState } from 'react';
import { Transacao } from '../types';
import { formatarMoeda } from '../utils/calculos';

interface FormularioDespesaProps {
  onSalvar: (transacao: Transacao) => void;
}

export function FormularioDespesa({ onSalvar }: FormularioDespesaProps) {
  const [descricao, setDescricao] = useState<string>('');
  const [valor, setValor] = useState<string>('');

  const handleSubmit = () => {
    const valorNum = parseFloat(valor);

    if (!descricao.trim()) {
      alert('Por favor, insira uma descrição para a despesa.');
      return;
    }

    if (isNaN(valorNum) || valorNum <= 0) {
      alert('Por favor, insira um valor válido para a despesa.');
      return;
    }

    const despesa: Transacao = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      tipo: 'saida',
      descricao,
      valor: valorNum,
      categoria: 'outros', // Adicionando categoria padrão para satisfazer o tipo Despesa
    };

    onSalvar(despesa);
    setDescricao('');
    setValor('');
  };

  return (
    <div className="bg-white border border-[#535353] rounded-[34px] p-6">
      <div className="mb-4">
        <label className="block font-normal text-[#243645] text-[18.074px] mb-2" style={{ fontVariationSettings: "'opsz' 14" }}>
          Descrição
        </label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Aluguel, contas, etc."
          className="w-full border border-[#dadad5] rounded-[20px] h-[63px] px-4 text-[#243645] text-[18.074px] font-normal outline-none"
          style={{ fontVariationSettings: "'opsz' 14" }}
        />
      </div>

      <div className="mb-6">
        <label className="block font-normal text-[#243645] text-[18.074px] mb-2" style={{ fontVariationSettings: "'opsz' 14" }}>
          Valor
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="R$ 0,00"
          className="w-full border border-[#dadad5] rounded-[20px] h-[63px] px-4 text-[#243645] text-[18.074px] font-normal outline-none"
          style={{ fontVariationSettings: "'opsz' 14" }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#243645] rounded-[25.5px] h-[58px] text-white text-[18.074px] font-normal hover:opacity-90 transition-opacity"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Registrar Despesa
      </button>
    </div>
  );
}
