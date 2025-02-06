import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserMenu from "./UserMenu";

import { Menu } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 flex h-16 items-center z-50 border-b bg-background px-4 md:px-8 w-full">
      <nav className="hidden md:flex items-center justify-between w-full">
        <Link to="/" className="flex items-center">
          <span className="text-xl text-black font-extrabold">Lana's</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Início
          </Link>
          <Link
            to="alunos"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Alunos
          </Link>
          <Link
            to="plano-aulas"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Planos de Aulas
          </Link>
          <Button onClick={() => navigate("/nova-aula")} variant="outline">
            Nova Aula
          </Button>
          <UserMenu />
        </div>
      </nav>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Link to="/" className="flex items-center">
          <span className="text-2xl text-black font-extrabold">Lana's</span>
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-6 mt-8">
            <div className="mt-auto">
                <UserMenu />
              </div>
              <Link
                to="/"
                onClick={handleNavigate}
                className="text-lg hover:text-muted-foreground"
              >
                Início
              </Link>
              <Link
                to="alunos"
                onClick={handleNavigate}
                className="text-lg hover:text-muted-foreground"
              >
                Alunos
              </Link>
              <Link
                to="plano-aulas"
                onClick={handleNavigate}
                className="text-lg hover:text-muted-foreground"
              >
                Plano de Aulas
              </Link>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/nova-aula");
                }}
              >
                Nova Aula
              </Button>
              
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export { Navbar };
