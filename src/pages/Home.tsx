import { useNavigate } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useLocalStorage } from "@/utils/storage";

import type { Class } from "./NewClass";

function Home() {
  const navigate = useNavigate();

  const [classes, setClasses] = useLocalStorage<Class[]>("classes", []);

  function handleRemoveClass(_id: string) {
    setClasses((prev) => prev.filter(({ id }) => id !== _id));
  }

  return (
    <div className="md:px-24 px-6 py-12 space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-4xl">Marcos</Label>
        <Button onClick={() => navigate("/nova-aula")} size="sm">
          Nova Aula
        </Button>
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col items-center justify-between bg-muted px-4 py-6 space-y-6 rounded-lg">
          <Label className="font-bold text-lg">Alunos</Label>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/alunos")}
          >
            Gerenciar
          </Button>
        </div>
        <div className="flex flex-col items-center justify-between bg-muted px-4 py-6 space-y-6 rounded-lg">
          <Label className="font-bold text-lg">Plano de Aulas</Label>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/plano-aulas")}
          >
            Gerenciar
          </Button>
        </div>
      </div>

      {!!classes.length && (
        <div className="space-y-4 mt-6">
          <Label className="text-2xl">Aulas Feitas</Label>

          <Accordion type="single" collapsible>
            {classes.map(
              ({ id, date, completedItems, studentName, comments }) => (
                <AccordionItem key={id} value={`item-${id}`}>
                  <AccordionTrigger>
                    {date} - {studentName}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {completedItems?.map((completedItem, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 space-y-2"
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          className="mt-3"
                        />
                        <label>{completedItem.text}</label>
                      </div>
                    ))}

                    <div className="bg-muted px-2 py-3 rounded-lg text-muted-foreground">
                      {comments}
                    </div>
                    <Button
                      variant="link"
                      className="w-full text-red-500"
                      onClick={() => handleRemoveClass(id)}
                    >
                      Apagar Aula
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
}

export default Home;
