"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema } from "@/lib/schemas/register";

const CARGOS = ["CONSULTOR", "SUPERVISOR", "GESTOR"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargo, setCargo] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      cargo,
    });
    if (!validation.success) {
      setError(validation.error.issues.map((e) => e.message).join(", "));

      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, cargo }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao cadastrar usuário");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary text-accent">
      <Card className="w-[350px] bg-primary text-accent shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-accent">
            Cadastro
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="flex flex-col gap-4">
            <Label htmlFor="name-register">Nome</Label>
            <Input
              id="name-register"
              type="text"
              placeholder="Nome"
              className="bg-white text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Label htmlFor="email-register">E-mail</Label>
            <Input
              id="email-register"
              type="email"
              placeholder="Email"
              className="bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Label htmlFor="password-register">Senha</Label>
            <Input
              id="password-register"
              type="password"
              placeholder="Senha"
              className="bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Label htmlFor="cargo-register">Cargo</Label>
            <Select onValueChange={(value) => setCargo(value)}>
              <SelectTrigger
                id="cargo-register"
                className="bg-white text-black"
              >
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CARGOS.map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>
                      {cargo}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full bg-primary text-accent hover:bg-muted"
            >
              Criar conta
            </Button>
            <p className="text-sm text-accent">
              Já tem conta?{" "}
              <a href="/login" className="text-white underline">
                Entrar
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
