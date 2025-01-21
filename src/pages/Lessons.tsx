import { useLocalStorage } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { LessonItem } from "@/types";

interface AddLessonItemProps {
  onAdd: (item: LessonItem) => void;
}

const lessonsSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(50),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(8).max(255).optional(),
      completed: z.boolean().default(false),
    }),
  ),
});

type Lesson = z.infer<typeof lessonsSchema>;

function AddLessonItem({ onAdd }: AddLessonItemProps) {
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (description.trim()) {
      onAdd({
        id: nanoid(7),
        description: description.trim(),
        completed: false,
      });
      setDescription("");
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel>Item da Aula</FormLabel>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Digite o item da aula"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleAdd} variant="secondary">
          Adicionar
        </Button>
      </div>
    </div>
  );
}

function Lessons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<LessonItem[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const form = useForm<Lesson>({
    resolver: zodResolver(lessonsSchema),
    defaultValues: {
      id: "",
      title: "",
      items: [],
    },
  });

  const [lessons, setLessons] = useLocalStorage<Lesson[]>("lessons", []);

  function toggleModal() {
    if (!isModalOpen) {
      setSelectedLesson(null);
      setItems([]);
      form.reset({
        id: "",
        title: "",
        items: [],
      });
    }
    setIsModalOpen((prev) => !prev);
  }

  const handleAddItem = (item: LessonItem) => {
    setItems([...items, item]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  function handleRemoveLesson(id: string) {
    setLessons((_lessons) => _lessons.filter((item) => item.id !== id));
  }

  function handleEditLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setItems(lesson.items);
    form.reset({
      ...lesson,
    });
    setIsModalOpen(true);
  }

  function handleSubmit() {
    const data = form.getValues();

    if (!data.title) {
      alert("O campo título é obrigatório.");
      return;
    }

    if (!items.length) {
      alert("Adicione ao menos um item ao plano de aulas.");
      return;
    }

    data.items = items;

    if (selectedLesson) {
      // Edit existing lesson
      setLessons((_lessons) =>
        _lessons.map((lesson) =>
          lesson.id === selectedLesson.id ? { ...data, id: lesson.id } : lesson,
        ),
      );
    } else {
      // Add new lesson
      setLessons((_lessons) => [
        ..._lessons,
        {
          ...data,
          id: nanoid(7),
        },
      ]);
    }

    setItems([]);
    form.reset();
    toggleModal();
  }

  return (
    <div className="px-6 md:px-24 py-12 space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-3xl">Plano de Aulas</Label>
        <Button onClick={toggleModal}>Novo Plano</Button>
      </div>

      {lessons.length === 0 && <p>Nenhum plano de aulas cadastrado.</p>}

      {lessons.length > 0 && (
        <Accordion type="single" collapsible>
          {lessons.map(({ id, title, items }, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="group">
                <div className="flex items-center justify-between w-full pr-4">
                  <span>{title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <ul className="space-y-2 list-disc list-inside">
                  {items.map((item, _index) => (
                    <li
                      key={_index}
                      className="flex items-center justify-between px-2 rounded-md"
                    >
                      - {item.description}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLesson({ id, title, items });
                  }}
                  className="w-full"
                >
                  Editar Plano de Aula
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Dialog modal open={isModalOpen} onOpenChange={toggleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Editar Plano de Aulas" : "Novo Plano de Aulas"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Aulas 1 e 2"
                      className="capitalize"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AddLessonItem onAdd={handleAddItem} />

            <div className="my-6 space-y-2 overflow-y-auto max-h-40">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 bg-zinc-100 rounded-md"
                >
                  <span>{item.description}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="mr-4 text-red-500"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              {selectedLesson ? "Atualizar" : "Salvar"}
            </Button>
            {selectedLesson && (
              <Button
                variant="link"
                className="w-full text-red-500"
                onClick={() => handleRemoveLesson(selectedLesson.id)}
              >
                Remover Plano de Aula
              </Button>
            )}
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Lesson };
export default Lessons;
