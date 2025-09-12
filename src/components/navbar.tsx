"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <nav className="p-4 bg-primary text-accent">
        <p>Carregando...</p>
      </nav>
    );
  }

  return (
    <nav className="p-4 bg-primary text-accent flex items-center justify-between">
      {/* Botão Menu Drawer sempre no canto esquerdo */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-accent" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-primary text-accent">
          <SheetHeader>
            <SheetTitle className="font-bold text-lg">Meu App</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            <a href="/" onClick={() => setOpen(false)}>
              🏠 Home
            </a>
            <a href="/sobre" onClick={() => setOpen(false)}>
              ℹ️ Sobre
            </a>
            <a href="/contato" onClick={() => setOpen(false)}>
              📞 Contato
            </a>
            {user ? (
              <span>Olá, {user}</span>
            ) : (
              <Button
                asChild
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                <a href="/login">Entrar</a>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo centralizada */}
      <span className="font-bold text-lg">Meu App</span>

      {/* Espaço no canto direito (login/saudação extra se quiser mostrar fora do drawer) */}
      <div className="hidden md:flex items-center">
        {user && <span>Olá, {user}</span>}
      </div>
    </nav>
  );
}
