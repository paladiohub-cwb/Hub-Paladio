"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast.success("Login realizado com sucesso!", {
        description: "Redirecionando para o painel...",
      });
      router.push("/home");
    } else {
      const data = await res.json().catch(() => null);

      if (data?.error === "INVALID_EMAIL") {
        toast.error("E-mail inválido", {
          description: "Verifique se digitou corretamente.",
          className: "bg-red-600 text-white border-red-700",
        });
      } else if (data?.error === "WRONG_PASSWORD") {
        toast.error("Senha incorreta", {
          description: "Tente novamente ou redefina sua senha.",
          className: "bg-red-600 text-white border-red-700",
        });
      } else {
        toast.error("Credenciais inválidas", {
          description: "Não conseguimos autenticar.",
          className: "bg-red-600 text-white border-red-700",
        });
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary text-accent">
      <Card className="w-[350px] bg-primary text-accent shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold text-accent">
            Login Hub Paladio
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="flex flex-col gap-4">
            <Label htmlFor="email-login">Digite seu e-mail</Label>
            <Input
              id="email-login"
              type="email"
              placeholder="Email"
              className="bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Label htmlFor="password-login">Digite sua senha</Label>
            <Input
              id="password-login"
              type="password"
              placeholder="Senha"
              className="bg-white text-black mb-2 rounded-[10px] border-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full bg-primary text-accent hover:bg-muted cursor-pointer hover:text-black"
            >
              Entrar
            </Button>
            <p className="text-sm text-accent">
              Não tem conta?{" "}
              <a href="/register" className="text-white underline">
                Cadastre-se
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
