import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import { z } from "zod";

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

import { useLocalStorage } from "@/utils/storage";

const formSchema = z.object({
  id: z.string(),
  studentNumber: z.string().optional(),
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  phone: z.string().min(14, "Telefone inválido").max(15),
  cpf: z
    .string()
    .min(14, "CPF inválido")
    .max(14)
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type Student = z.infer<typeof formSchema>;

const MaskedInput = forwardRef<
  HTMLInputElement,
  {
    mask: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }
>((props, ref) => (
  // @ts-expect-error custom input
  <InputMask
    {...props}
    mask={props.mask}
    value={props.value}
    onChange={props.onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}
    placeholder={props.placeholder}
  >
    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input ref={ref} {...inputProps} />
    )}
  </InputMask>
));

MaskedInput.displayName = "MaskedInput";

function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const form = useForm<Student>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      studentNumber: "",
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
        studentNumber: "",
        name: "",
        phone: "",
        cpf: "",
      });
    }
    setIsModalOpen((prev) => !prev);
  }

  function handleEditStudent(student: Student) {
    setSelectedStudent(student);
    form.reset(student);
    setIsModalOpen(true);
  }

  function handleSubmit(student: Student) {
    if (selectedStudent) {
      setStudents((_students) =>
        _students.map((s) =>
          s.id === selectedStudent.id ? { ...student, id: s.id } : s,
        ),
      );
    } else {
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
    toggleModal();
  }

  return (
    <div className="container space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-4xl">Alunos</Label>
        <Button onClick={toggleModal}>Novo Aluno</Button>
      </div>

      {students.length === 0 && (
        <p className="text-muted-foreground text-center">
          Nenhum aluno cadastrado.
        </p>
      )}

      <div className="space-y-4">
        {students.map(({ id, studentNumber, name, phone, cpf }) => (
          <div key={id} className="space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-lg">{name}</Label>
                  {!!studentNumber?.length && (
                    <span className="text-sm text-muted-foreground">
                      #{studentNumber}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
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
                      <Input {...field} maxLength={5} placeholder="12345" />
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
                      <MaskedInput
                        mask="(99) 99999-9999"
                        placeholder="Ex: (11) 91234-1234"
                        {...field}
                      />
                    </FormControl>
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
                      {/* @ts-expect-error cpf is optional */}
                      <MaskedInput
                        mask="999.999.999-99"
                        placeholder="Ex: 123.456.789-00"
                        {...field}
                      />
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
                  Apagar Aluno
                </Button>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { Student };

export default Students;
