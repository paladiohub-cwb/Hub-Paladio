export interface userDistribuitionCategorie {
  id: string;
  nome: string;
  part: number;
  tipo: string;
}

export interface CategoriesType {
  id: string;
  nome: string;
  valorParaDistribuicao: number;
  users: userDistribuitionCategorie[];
}
