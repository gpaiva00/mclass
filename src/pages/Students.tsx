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
  studentNumber: z.string().length(5),
  name: z.string().min(2).max(50),
  phone: z.string().min(8).max(15),
  cpf: z.string().min(11).max(14).optional(),
});

type Student = z.infer<typeof formSchema>;

function generateStudentNumber() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const form = useForm<Student>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      studentNumber: generateStudentNumber(),
      name: "",
      phone: "",
      cpf: "",
    },
  });

  const [students, setStudents] = useLocalStorage<Student[]>("students", []);

  function toggleModal() {
    if (!isModalOpen) {
      setSelectedStudent(null);
      form.reset({
        id: "",
        studentNumber: generateStudentNumber(),
        name: "",
        phone: "",
        cpf: "",
      });
    }
    setIsModalOpen((prev) => !prev);
  }

  function toggleRemoveModal() {
    setIsRemoveModalOpen((prev) => !prev);
  }

  function handleEditStudent(student: Student) {
    setSelectedStudent(student);
    form.reset(student);
    setIsModalOpen(true);
  }

  function handleSubmit(student: Student) {
    if (selectedStudent) {
      // Edit existing student
      setStudents((_students) =>
        _students.map((s) =>
          s.id === selectedStudent.id ? { ...student, id: s.id } : s,
        ),
      );
    } else {
      // Add new student
      setStudents((_students) => [
        ..._students,
        {
          ...student,
          id: nanoid(7),
        },
      ]);
    }

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
        <Button onClick={toggleModal}>Novo Aluno</Button>
      </div>

      <div className="space-y-4">
        {students.map(({ id, studentNumber, name, phone, cpf }) => (
          <div key={id} className="space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-lg">{name}</Label>
                  <span className="text-sm text-muted-foreground">
                    #{studentNumber}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  onClick={() =>
                    handleEditStudent({
                      id,
                      studentNumber,
                      name,
                      phone,
                      cpf,
                    })
                  }
                >
                  Editar
                </Button>
              </div>
            </div>
            <hr />
          </div>
        ))}

        {students.length === 0 && <p>Nenhum aluno cadastrado.</p>}
      </div>

      <Dialog modal open={isModalOpen} onOpenChange={toggleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? "Editar Aluno" : "Novo Aluno"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Aluno</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123.456.789-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {selectedStudent ? "Atualizar" : "Salvar"}
              </Button>
              {selectedStudent && (
                <Button
                  variant="link"
                  onClick={() => handleRemoveStudent(selectedStudent.id)}
                  className="text-red-500 w-full"
                >
                  Remover Aluno
                </Button>
              )}
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
