import { Material, ModeloConfig, Configuracoes } from '../types';

export function calcularCustoOperacao(
  modelo: ModeloConfig,
  material: Material,
  custosFixos: { valor: number }[]
): number {
  const consumo = modelo.consumoPorMaterial[material.id] || 0;
  const custoMaterial = consumo * material.precoPorKg;
  const somaFixos = custosFixos.reduce((acc, custo) => acc + custo.valor, 0);
  return custoMaterial + somaFixos;
}

export function calcularMaoObra(modelo: ModeloConfig, material: Material): number {
  return modelo.maoObraPorMaterial[material.id] || 0;
}

export function calcularMargemExcedente(
  valorTotal: number,
  custoOperacao: number,
  maoObra: number
): number {
  return valorTotal - (custoOperacao + maoObra);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function obterNomeModelo(modelo: ModeloConfig): string {
  return modelo.nome;
}

export function obterNomeMaterial(material: Material): string {
  return material.nome;
}
