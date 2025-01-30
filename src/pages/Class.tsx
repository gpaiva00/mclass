import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { lessonCategories } from "@/constants/lessonCategories";
import { useLocalStorage } from "@/utils/storage";

import type { Lesson } from "./Lessons";
import type { Class } from "./NewClass";
import type { Student } from "./Students";

interface CheckedItem {
  id: string;
  text: string;
}

function Class() {
  const navigate = useNavigate();

  const [currentClassData] = useLocalStorage<Class | null>(
    "currentClass",
    null,
  );
  const [classes, setClasses] = useLocalStorage<Class[]>("classes", []);
  const [students] = useLocalStorage<Student[]>("students", []);
  const [lessons] = useLocalStorage<Lesson[]>("lessons", []);

  const [comments, setComments] = useState(currentClassData?.comments || "");
  const [checkedItems, setCheckedItems] = useState<CheckedItem[]>(
    currentClassData?.completedItems || [],
  );
  const [currentDate, setCurrentDate] = useState(() => {
    if (currentClassData?.date) {
      return currentClassData.date;
    }
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const student = students.find(
    (_student) => _student.id === currentClassData?.studentId,
  );

  const lesson = lessons.find(
    (_lesson) => _lesson.id === currentClassData?.lessonId,
  );

  const noCheckedItems = useMemo(
    () => Object.values(checkedItems).every((value) => !value),
    [checkedItems],
  );

  const isEditing = currentClassData?.isEditing;

  function handleCheckboxChange(id: string, text: string) {
    setCheckedItems((prev) => {
      const isItemChecked = prev.some((item) => item.id === id);
      return isItemChecked
        ? prev.filter((item) => item.id !== id)
        : [...prev, { id, text }];
    });
  }

  function handleDateChange(value: string) {
    setCurrentDate(value);
  }

  function handleFinish() {
    const updatedClassData: Class = {
      ...currentClassData!,
      comments,
      completedItems: checkedItems,
      date: currentDate,
    };

    if (isEditing) {
      // Modo edição - atualiza a aula existente
      setClasses((_classes) =>
        _classes.map((c) =>
          c.id === currentClassData?.id ? updatedClassData : c,
        ),
      );
    } else {
      // Modo criação - adiciona nova aula
      setClasses((_classes) => [..._classes, updatedClassData]);
    }

    navigate("/");
  }

  return (
    <div className="container space-y-8">
      <div className="w-full flex justify-between items-center mb-8">
        <Label className="text-3xl">{isEditing ? "Editar Aula" : "Aula"}</Label>
        <Button onClick={handleFinish} disabled={noCheckedItems}>
          {isEditing ? "Salvar Alterações" : "Finalizar Aula"}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="bg-zinc-100 flex items-center justify-between py-4 px-4 rounded-lg">
          <Label>Aluno selecionado: {student?.name}</Label>
        </div>
        <div className="bg-zinc-100 flex items-center justify-between py-4 px-4 rounded-lg">
          <Label>
            Categoria:{" "}
            {
              lessonCategories.find(
                (cat) => cat.id === currentClassData?.categoryId,
              )?.name
            }
          </Label>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 w-full">
          <Label>Data da aula</Label>
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="Insira a data da aula"
          />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-md">Itens da Aula</CardTitle>
          </CardHeader>

          <CardContent>
            {lesson?.items.map((lessonItem, index) => (
              <div key={index} className="flex items-center gap-2 space-y-2">
                <input
                  type="checkbox"
                  id={lessonItem.id}
                  checked={checkedItems.some(
                    (item) => item.id === lessonItem.id,
                  )}
                  onChange={() =>
                    handleCheckboxChange(
                      lessonItem.id,
                      lessonItem.description || "",
                    )
                  }
                  className="mt-3"
                />
                <label htmlFor={lessonItem.id}>{lessonItem.description}</label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-md">Observações</CardTitle>
          </CardHeader>

          <CardContent>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Adicione algum comentário sobre a aula se preferir..."
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleFinish}
          disabled={noCheckedItems}
          className="w-full"
        >
          {isEditing ? "Salvar Alterações" : "Finalizar Aula"}
        </Button>
      </div>
    </div>
  );
}

export type { CheckedItem };
export default Class;
