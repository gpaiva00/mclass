import { useState } from "react"; // Add this import
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Menu } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Add state for Sheet

  const handleNavigate = () => {
    setIsOpen(false); // Close sheet when navigating
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 z-50 border-b bg-background px-4 md:px-8 w-full">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:justify-between md:gap-5 md:text-sm lg:gap-6 w-full">
        {/* Desktop nav remains unchanged */}
        <Link to="/" className="">
          <span className="text-2xl md:text-xl text-black font-extrabold">
            Lana's
          </span>
        </Link>
        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-6">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Início
          </Link>
          <Link
            to="alunos"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Alunos
          </Link>
          <Link
            to="plano-aulas"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Planos de Aulas
          </Link>
          <Button onClick={() => navigate("/nova-aula")} variant="outline">
            Nova Aula
          </Button>
        </div>
      </nav>
      <Link to="/" className="md:hidden visible w-full">
        <span className="text-2xl md:text-xl text-black font-extrabold">
          Lana's
        </span>
      </Link>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden flex items-center gap-2"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <nav className="grid gap-6 text-lg font-medium mt-8">
            <Link
              to="/"
              onClick={handleNavigate}
              className="hover:text-muted-foreground"
            >
              Início
            </Link>
            <Link
              to="alunos"
              onClick={handleNavigate}
              className="hover:text-muted-foreground"
            >
              Alunos
            </Link>
            <Link
              to="plano-aulas"
              onClick={handleNavigate}
              className="hover:text-muted-foreground"
            >
              Plano de Aulas
            </Link>
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate("/nova-aula");
              }}
              variant="outline"
            >
              Nova Aula
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

export { Navbar };
