import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLocalStorage } from "@/utils/storage";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  phone: z.string().min(8).max(15),
});

type Student = z.infer<typeof formSchema>;

function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const form = useForm<Student>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      phone: "",
    },
  });

  const [students, setStudents] = useLocalStorage<Student[]>("students", []);

  function toggleModal() {
    setIsModalOpen((prev) => !prev);
  }

  function toggleRemoveModal() {
    setIsRemoveModalOpen((prev) => !prev);
  }

  function handleSubmit(student: Student) {
    setStudents((_students) => [
      ..._students,
      {
        ...student,
        id: nanoid(7),
      },
    ]);

    form.reset();
    toggleModal();
  }

  function handleRemoveStudent(_id: string) {
    setStudents((prev) => prev.filter(({ id }) => id !== _id));
  }

  return (
    <div className="px-6 md:px-24 py-12 space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-4xl">Alunos</Label>
        <Button onClick={toggleModal} size="sm">
          Novo Aluno
        </Button>
      </div>

      <div className="space-y-4">
        {students.map(({ id, name }, index) => (
          <>
            <div
              key={index}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-lg">{name}</Label>
              <Button
                variant="link"
                onClick={() => handleRemoveStudent(id)}
                className="text-red-500"
              >
                Remover
              </Button>
            </div>
            <hr />
          </>
        ))}

        {students.length === 0 && <p>Nenhum aluno cadastrado.</p>}
      </div>

      <Dialog modal open={isModalOpen} onOpenChange={toggleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Aluno</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Julia Maris..."
                        className="capitalize"
                        {...field}
                      />
                    </FormControl>
                    {/* <FormDescription>This is your public display name.</FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone para contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 91234-1234" {...field} />
                    </FormControl>
                    <FormDescription>
                      Digite no formato (xx) xxxxx-xxxxx
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveModalOpen} onOpenChange={toggleRemoveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Aluno</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o aluno?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={toggleRemoveModal}>
              Cancelar
            </Button>
            <Button onClick={toggleRemoveModal}>Remover</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Student };

export default Students;
