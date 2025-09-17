export interface userStoreType {
  _id?: string | undefined;
  storeId: string;
  userId: string;
  storeName: string;
  userName: string;
  cargo: string;
  dataEntrada: string;
  cnpjLoja?: string;
  codEquipe: number;
}
