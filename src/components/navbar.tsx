"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation"

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

  const router = useRouter()
  const pathname = usePathname()

  if (loading) {
    return (
      <nav className="p-4 bg-primary text-accent">
        <p>Carregando...</p>
      </nav>
    );
  }

  return (
    <nav className="w-7xl relative m-auto p-4 flex justify-between items-center">

      <span className="font-bold text-lg">
        <img src="/logo-hub.svg" alt="Logo" />
      </span>

     <ul className="flex items-center gap-8 hover:cursor">

      <li 
        className={ pathname == "/" ? `font-black ` : `` }
        onClick={ () => router.push("/") }>
          Dashboard</li>
      <li className={ pathname == "/relatorios" ? `font-black ` : `` }
        onClick={ () => router.push("/relatorios") }>
        Recibos
      </li>
      <li className={ pathname == "/commissioned" ? `font-black ` : `` }
        onClick={ () => router.push("/commissioned") }>
        Comissionados</li>
      <li className={ pathname == "/reports" ? `font-black ` : `` }
        onClick={ () => router.push("/reports") }>Relatórios</li>
      <li>Sair</li>

      <li>
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
              <SheetTitle className="font-bold text-lg"></SheetTitle>
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
      </li>

     </ul>

      {/* Espaço no canto direito (login/saudação extra se quiser mostrar fora do drawer)
      <div className="hidden md:flex items-center">
        {user && <span>Olá, {user}</span>}
      </div> */}
    </nav>
  );
}
