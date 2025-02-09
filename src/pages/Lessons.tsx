import { useCloudStorage } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SearchBar } from "@/components";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { lessonCategories } from "@/constants/lessonCategories";
import type { LessonItem } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Componente para adicionar novos itens
interface AddLessonItemProps {
  onAdd: (item: LessonItem) => void;
}

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
        <Button onClick={handleAdd} variant="secondary" type="button">
          Adicionar
        </Button>
      </div>
    </div>
  );
}

// Componente para editar itens existentes
interface EditLessonItemProps {
  item: LessonItem;
  onSave: (updatedItem: LessonItem) => void;
  onCancel: () => void;
}

function EditLessonItem({ item, onSave, onCancel }: EditLessonItemProps) {
  const [description, setDescription] = useState(item.description);

  function handleSave() {
    if (description?.trim()) {
      onSave({
        ...item,
        description: description?.trim(),
      });
    }
  }

  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 rounded-md">
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-grow"
      />
      <div className="flex space-x-2">
        <Button onClick={handleSave} variant="secondary" size="sm">
          Salvar
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

const lessonsSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(50),
  categoryId: z.string().min(1, "A categoria é obrigatória"),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(8).max(255).optional(),
      completed: z.boolean().default(false),
    }),
  ),
});

type Lesson = z.infer<typeof lessonsSchema>;

function Lessons() {
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<LessonItem[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const form = useForm<Lesson>({
    resolver: zodResolver(lessonsSchema),
    defaultValues: {
      id: "",
      title: "",
      categoryId: "",
      items: [],
    },
  });

  const { value: lessons, setValue: setLessons, loading } = useCloudStorage<Lesson[]>("lessons", []);
  const [orderedCategories, setOrderedCategories] = useState(lessonCategories);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData('text/plain', index.toString());
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverItem(index);
  }

  function handleDragEnd(e: React.DragEvent) {
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const targetIndex = dragOverItem;

    if (targetIndex === null || sourceIndex === targetIndex) return;

    const items = Array.from(orderedCategories);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, reorderedItem);

    setOrderedCategories(items);
    setDragOverItem(null);
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando planos de aula...</p>
        </div>
      </div>
    );
  }

  // Agrupamento de lições por categoria
  const lessonsByCategory = lessons.reduce(
    (acc, lesson) => {
      const category = lessonCategories.find(
        (cat) => cat.id === lesson.categoryId,
      );
      if (category) {
        if (!acc[category.id]) {
          acc[category.id] = {
            category,
            lessons: [],
          };
        }
        acc[category.id].lessons.push(lesson);
      } else {
        const uncategorizedId = "uncategorized";
        if (!acc[uncategorizedId]) {
          acc[uncategorizedId] = {
            category: {
              id: uncategorizedId,
              name: "Sem categoria",
              slug: "sem-categoria",
              description: "Lições sem categoria definida",
            },
            lessons: [],
          };
        }
        acc[uncategorizedId].lessons.push(lesson);
      }
      return acc;
    },
    {} as Record<string, { category: Category; lessons: Lesson[] }>,
  );

  const filteredLessonsByCategory = Object.entries(lessonsByCategory)
    .map(([categoryId, { category, lessons }]) => ({
      categoryId,
      category,
      lessons: lessons.filter((lesson) =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(({ lessons }) => lessons.length > 0);

  const visibleCategories = orderedCategories.filter(category =>
    filteredLessonsByCategory.some(filtered => filtered.category.id === category.id)
  );

  function toggleModal() {
    if (!isModalOpen) {
      setSelectedLesson(null);
      setItems([]);
      setEditingItemId(null);
      form.reset({
        id: "",
        title: "",
        categoryId: "",
        items: [],
      });
    }
    setIsModalOpen((prev) => !prev);
  }

  function handleAddItem(item: LessonItem) {
    setItems([...items, item]);
  }

  function handleRemoveItem(id: string) {
    setItems(items.filter((item) => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  }

  function handleEditItem(id: string) {
    setEditingItemId(id);
  }

  function handleUpdateItem(updatedItem: LessonItem) {
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    setEditingItemId(null);
  }

  function handleCancelEdit() {
    setEditingItemId(null);
  }

  function handleRemoveLesson(id: string) {
    setLessons((_lessons) => _lessons.filter((item) => item.id !== id));
  }

  function handleEditLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setItems(lesson.items);
    setEditingItemId(null);
    form.reset({
      ...lesson,
    });
    setIsModalOpen(true);
  }

  function handleSubmit(data: Lesson) {
    if (!items.length) {
      alert("Adicione ao menos um item ao plano de aulas.");
      return;
    }

    const lessonData = {
      ...data,
      items: items
    };

    if (selectedLesson) {
      setLessons((_lessons) =>
        _lessons.map((lesson) =>
          lesson.id === selectedLesson.id ? { ...lessonData, id: lesson.id } : lesson,
        ),
      );
    } else {
      setLessons((_lessons) => [
        ..._lessons,
        {
          ...lessonData,
          id: nanoid(7),
        },
      ]);
    }

    setItems([]);
    setEditingItemId(null);
    form.reset();
    toggleModal();
  }

  return (
    <div className="container space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-3xl">Plano de Aulas</Label>
        <Button onClick={toggleModal}>Novo Plano</Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Pesquisar por título..."
      />

      {filteredLessonsByCategory.length === 0 && (
        <p className="text-muted-foreground text-center">
          {searchTerm
            ? "Nenhuma aula encontrada."
            : "Nenhum plano de aulas cadastrado."}
        </p>
      )}

      <div className="space-y-4">
        {visibleCategories.map((category, index) => (
          <div
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`space-y-4 cursor-move transition-all ${dragOverItem === index ? 'border-t-2 border-primary bg-muted/50 rounded-lg p-2' : ''}`}
          >
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <Accordion type="single" collapsible className="mb-8">
              {filteredLessonsByCategory
                .find((filtered) => filtered.category.id === category.id)?.lessons
                .map(({ id, title, items }) => (
                  <AccordionItem key={id} value={id}>
                    <AccordionTrigger className="group">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <ul className="space-y-2 list-disc list-inside">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between px-2 rounded-md"
                          >
                            - {item.description}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLesson({ id, title, categoryId: category.id, items });
                        }}
                        className="w-full"
                      >
                        Editar Plano de Aula
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        ))}
      </div>

      <Dialog modal open={isModalOpen} onOpenChange={toggleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLesson ? "Editar Plano de Aulas" : "Novo Plano de Aulas"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lessonCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AddLessonItem onAdd={handleAddItem} />
              </div>

              <div className="my-6 space-y-2 overflow-y-auto max-h-40">
                {items.map((item) => (
                  <div key={item.id}>
                    {editingItemId === item.id ? (
                      <EditLessonItem
                        item={item}
                        onSave={handleUpdateItem}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 rounded-md">
                        <span>{item.description}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item.id)}
                            className="text-blue-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full">
                {selectedLesson ? "Atualizar" : "Salvar"}
              </Button>
              {selectedLesson && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-red-500"
                  onClick={() => handleRemoveLesson(selectedLesson.id)}
                >
                  Apagar Plano de Aula
                </Button>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Category, Lesson };
export default Lessons;
