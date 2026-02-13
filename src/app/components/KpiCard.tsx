import React from 'react';
import { formatarMoeda } from '../utils/calculos';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  descricao: string;
  variante: 'escuro' | 'medio' | 'claro';
}

export function KpiCard({ titulo, valor, icone: Icone, descricao, variante }: KpiCardProps) {
  const varianteClasses = {
    escuro: 'bg-gradient-to-br from-black to-gray-900 text-white',
    medio: 'bg-gradient-to-br from-gray-800 to-gray-700 text-white',
    claro: 'bg-gradient-to-br from-gray-200 to-gray-100 text-black',
  };

  const iconeBg = {
    escuro: 'bg-white/10',
    medio: 'bg-white/10',
    claro: 'bg-black/5',
  };

  const statusIndicador = valor >= 0 ? '●' : '▼';
  const statusColor = valor >= 0 ? (variante === 'claro' ? 'text-green-600' : 'text-green-400') : 'text-red-400';

  return (
    <div
      className={`relative rounded-2xl p-6 shadow-2xl ${varianteClasses[variante]} transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl overflow-hidden group`}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">
              {titulo}
            </p>
            <p className={`text-4xl font-black tabular-nums tracking-tight ${statusColor}`}>
              {formatarMoeda(valor)}
            </p>
          </div>
          <div className={`${iconeBg[variante]} p-3 rounded-xl backdrop-blur-sm`}>
            <Icone className="w-8 h-8" strokeWidth={2} />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-current/20">
          <span className={`text-lg ${statusColor}`}>{statusIndicador}</span>
          <p className="text-xs font-medium opacity-80">{descricao}</p>
        </div>
      </div>
    </div>
  );
}