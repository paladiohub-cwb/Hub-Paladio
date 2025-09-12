import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db.json");

type User = {
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
