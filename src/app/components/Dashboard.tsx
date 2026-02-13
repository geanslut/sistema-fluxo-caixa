import React from 'react';
import { Saldos, Transacao } from '../types';
import { formatarMoeda } from '../utils/calculos';

interface DashboardProps {
  saldos: Saldos;
  transacoes: Transacao[];
}

export function Dashboard({ saldos }: DashboardProps) {
  return (
    <div>
      

      <div className="space-y-4">
        {/* Capital de Giro */}
        <div className="bg-[#243645] rounded-[34px] p-6 h-[195px] relative">
          <p className="font-normal text-[18.074px] text-white mb-4" style={{ fontVariationSettings: "'opsz' 14" }}>
            Capital de Giro
          </p>
          <p className={`font-semibold text-[41.95px] mb-4 ${
            saldos.capitalGiro < 0 ? 'text-red-500' : 'text-[#05df7d]'
          }`} style={{ fontVariationSettings: "'opsz' 14" }}>
            {formatarMoeda(saldos.capitalGiro)}
          </p>
          <div className="h-[1px] bg-white opacity-38 mb-3" />
          <div className="flex items-center gap-2">
            <div className={`size-[11px] rounded-full ${
              saldos.capitalGiro < 0 ? 'bg-red-500' : 'bg-[#05df7d]'
            }`} />
            <p className="font-light text-[#cecece] text-[9.88px] text-[14px]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Saldo para reposição de material
            </p>
          </div>
          <div className="absolute right-6 top-6 bg-[#294c65] rounded-[15px] size-[51px] flex items-center justify-center">
            <p className="font-normal text-white text-[27.932px]" style={{ fontVariationSettings: "'opsz' 14" }}>
              $
            </p>
          </div>
        </div>

        {/* Renda Disponível */}
        <div className="bg-[#294c65] rounded-[34px] p-6 h-[195px] relative">
          <p className="font-normal text-[18.074px] text-white mb-4" style={{ fontVariationSettings: "'opsz' 14" }}>
            Renda Disponível
          </p>
          <p className="font-semibold text-[#05df7d] text-[41.95px] mb-4" style={{ fontVariationSettings: "'opsz' 14" }}>
            {formatarMoeda(saldos.rendaDisponivel)}
          </p>
          <div className="h-[1px] bg-white opacity-38 mb-3" />
          <div className="flex items-center gap-2">
            <div className="size-[11px] rounded-full bg-[#05df7d]" />
            <p className="font-light text-[#cecece] text-[9.88px] text-[14px]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Saldo acumulado de mão de obra
            </p>
          </div>
          <div className="absolute right-6 top-6 bg-[#243645] rounded-[15px] size-[51px] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" strokeWidth={2} viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Fundo de Reserva */}
        <div className="bg-[#dadad5] rounded-[34px] p-6 h-[195px] relative shadow-[0px_13px_33px_0px_rgba(0,0,0,0.25)]">
          <p className="font-normal text-[18.074px] text-[#243645] mb-4" style={{ fontVariationSettings: "'opsz' 14" }}>
            Fundo de Reserva
          </p>
          <p className="font-semibold text-[#05df7d] text-[41.95px] mb-4" style={{ fontVariationSettings: "'opsz' 14" }}>
            {formatarMoeda(saldos.fundoReserva)}
          </p>
          <div className="h-[1px] bg-[#243645] opacity-38 mb-3" />
          <div className="flex items-center gap-2">
            <div className="size-[11px] rounded-full bg-[#05df7d]" />
            <p className="font-light text-[#243645] text-[9.88px] text-[14px]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Saldo da margem excedente
            </p>
          </div>
          <div className="absolute right-6 top-6 bg-[#294c65] rounded-[15px] size-[51px] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" strokeWidth={2} viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-[#243645] opacity-38 mt-6" />
    </div>
  );
}