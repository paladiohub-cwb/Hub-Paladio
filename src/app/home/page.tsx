import { getUserFromCookies, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default async function HomePage() {
  const userName = await getUserFromCookies();

  return (
    <main className="min-h-screen bg-primary text-accent">
      <Navbar />
      <div className="flex items-center justify-center p-10">
        <div className="w-[400px] bg-primary text-accent rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Bem-vindo, {userName} 👋</h1>
          <p className="mb-6 text-muted">
            Você está logado no sistema. Esse é o seu dashboard inicial.
          </p>
          <form action={logout}>
            <Button
              type="submit"
              className="w-full  text-accent bg-red-600 hover:bg-secondary"
            >
              Sair
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
