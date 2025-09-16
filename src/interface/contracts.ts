// Tipagem do contrato com nomes 'sujos'
export type RawContrato = {
  Status: string;
  "Valor bruto": number;
  "% comissão": number;
  "Nome ponto de venda": string;
  Grupo: number;
  Cota: number;
  Segmento: string;
  Contrato: number;
  "Crédito atualizado": string;
  Vendedor: number;
  Equipe: number;
  "Data da venda": string;
  Parcela: number;
  "Nome do Cliente": string;
  Categoria: string;
  aviso?: string;
};

// Tipagem do contrato com nomes 'limpos' (camelCase)
export type Contrato = {
  status: string;
  valorBruto: number;
  comissao: number;
  nomePontoDeVenda: string;
  grupo: number;
  cota: number;
  segmento: string;
  contrato: number;
  creditoAtualizado: string;
  vendedor: number;
  equipe: number;
  dataDaVenda: string;
  parcela: number;
  nomeDoCliente: string;
  categoria: string;
  aviso?: string;
};
