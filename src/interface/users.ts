export interface UserType {
  id?: string;
  nome: string;
  email: string;
  cod: number;
  password: string;
  cargo: "CONSULTOR" | "GESTOR";
  codSupervisor?: number;
  ativo?: boolean;
  comissao?: number;
}

export interface UserStrore {
  _id?: string;
  idStore?: string;
  idUser?: string;
  userName: string;
  storeName: string;
  cargo: string;
  dataDeEntrada?: string;
}

export interface RegisterInBulkType {
  id?: string;
  nome: string;
  email: string;
  ativo?: boolean;
}

interface StoreUserInfoType {
  _id?: string;
  cod: number;
  password: string;
  cargo: "CONSULTOR" | "GESTOR";
  codSupervisor?: number;
  comissao?: number;
}

interface UserBulk {
  id?: string;
  nome: string;
  email: string;
  password: string;
  ativo?: boolean;
  comissao?: number;
  stores: StoreUserInfoType[];
}
