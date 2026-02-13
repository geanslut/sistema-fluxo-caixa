export type MaterialType = 'fibra' | 'fio';
export type ModeloType = 'cestinha' | 'banqueta' | 'cadeira_loja' | 'mesa' | 'cadeira_tradicional';

export interface Venda {
  id: string;
  data: string;
  modeloId: string;
  materialId: string;
  valorTotal: number;
  custoOperacao: number;
  maoObra: number;
  margemExcedente: number;
  tipo: 'entrada';
  tipoOperacao?: 'reforma' | 'fabricacao'; // Tipo de operação
  custoFerro?: number; // Custo do ferro para fabricação
  itens?: ItemVenda[]; // Novo: lista de itens da venda
}

export interface ItemVenda {
  modeloId: string;
  materialId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  custoOperacao: number;
  maoObra: number;
  margemExcedente: number;
  tipoOperacao?: 'reforma' | 'fabricacao'; // Tipo de operação
  custoFerro?: number; // Custo do ferro para fabricação
}

export interface Despesa {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: 'insumos' | 'gasolina' | 'epis' | 'outros';
  tipo: 'saida';
  itens?: ItemDespesa[]; // Novo: lista de itens da despesa
}

export interface ItemDespesa {
  descricao: string;
  categoria: 'insumos' | 'gasolina' | 'epis' | 'outros';
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Retirada {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'retirada';
}

export type Transacao = Venda | Despesa | Retirada;

export interface Saldos {
  capitalGiro: number;
  rendaDisponivel: number;
  fundoReserva: number;
  totalReformas: number; // Novo campo
  totalFabricacao: number; // Novo campo
}

// Novos tipos para configurações
export interface Material {
  id: string;
  nome: string;
  precoPorKg: number;
  cor: string;
}

export interface CustoFixo {
  id: string;
  descricao: string;
  valor: number;
}

export interface ModeloConfig {
  id: string;
  nome: string;
  consumoPorMaterial: { [materialId: string]: number }; // KG por material
  maoObraPorMaterial: { [materialId: string]: number }; // Valor MO por material
  custoFerro: number; // Novo: custo de ferro para fabricação
}

export interface Configuracoes {
  materiais: Material[];
  custosFixos: CustoFixo[];
  modelos: ModeloConfig[];
}