export function convertStringInNumber(valor: string): number {
  if (!valor) return 0;

  // Remove "R$", espaços e pontos de milhar, troca vírgula por ponto
  const limpo = valor
    .replace(/[^\d,.-]/g, "") // remove tudo que não for número, vírgula, ponto ou sinal
    .replace(/\./g, "") // remove pontos de milhar
    .replace(",", "."); // troca vírgula decimal por ponto

  return parseFloat(limpo) || 0;
}
