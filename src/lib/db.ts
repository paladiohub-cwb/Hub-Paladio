import fs from "fs";
import path from "path";
import { Contrato } from "@/interface/contracts";
const DB_FILE = path.join(process.cwd(), "src/mocks/db.json");
const DB_CONTRATOS = path.join(process.cwd(), "src/mocks/dbCONTRATOS.json");

export type User = {
  name: string;
  email: string;
  password: string;
  cargo: string;
};

function readDB(): User[] {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data) as User[];
}

export function readDBCONTRATOS(): Contrato[] {
  if (!fs.existsSync(DB_CONTRATOS)) {
    fs.writeFileSync(DB_CONTRATOS, JSON.stringify([]));
    return [];
  }

  const data = fs.readFileSync(DB_CONTRATOS, "utf-8").trim();

  if (!data) {
    // Se o arquivo estiver vazio, corrige
    fs.writeFileSync(DB_CONTRATOS, JSON.stringify([]));
    return [];
  }

  try {
    return JSON.parse(data) as Contrato[];
  } catch (err) {
    console.error("Arquivo dbCONTRATOS.json corrompido. Resetando...");
    fs.writeFileSync(DB_CONTRATOS, JSON.stringify([]));
    return [];
  }
}

export function writeCONTRATOS(contratos: Contrato[]) {
  fs.writeFileSync(DB_CONTRATOS, JSON.stringify(contratos, null, 2));
}

export function createCONTRACTS(contrato: Contrato) {
  const contracts = readDBCONTRATOS();
  contracts.push(contrato);
  writeCONTRATOS(contracts);
}
function writeDB(users: User[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export function addUser(user: User) {
  const users = readDB();
  if (users.find((u) => u.email === user.email)) {
    throw new Error("Usuário já existe");
  }
  users.push(user);
  writeDB(users);
}

export function getUser(email: string, password: string): User | null {
  const users = readDB();
  return (
    users.find((u) => u.email === email && u.password === password) || null
  );
}
