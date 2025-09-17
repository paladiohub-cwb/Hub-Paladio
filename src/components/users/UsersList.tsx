"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Store {
  idStore: string;
  storeName: string;
  cod: number;
  cargo: string;
  userName: string;
  codSupervisor: number | null;
}

interface User {
  _id: string;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
  comissao: number;
  stores: Store[];
  id: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Comissão</TableHead>
          <TableHead>COD</TableHead>
          <TableHead>LOJA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell>{user.nome}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.cargo}</TableCell>
            <TableCell>{user.ativo ? "Sim" : "Não"}</TableCell>
            <TableCell>{user.comissao}</TableCell>
            <TableCell>
              {user.stores.map((store) => (
                <div key={store.cod}>{store.cod}</div>
              ))}
            </TableCell>
            <TableCell>
              {user.stores.map((store) => (
                <div key={store.idStore}>{store.storeName}</div>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
