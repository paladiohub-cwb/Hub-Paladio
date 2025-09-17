export interface userDistributionCategorie {
  id: string;
  nome: string;
  part: number;
  tipo: string;
}

export interface DistribuicaoPadraoType {
  tipo: "store" | "user";
  nome: string;
  part: number;
}

export interface CategoriesType {
  id: string;
  nome: string;
  valorParaDistribuicao: number;
  users: userDistributionCategorie[];
}
