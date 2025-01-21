import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useLocalStorage } from "@/utils/storage";

import type { Lesson } from "./Lessons";
import type { Class } from "./NewClass";
import type { Student } from "./Students";

interface CheckedItem {
  id: string;
  text: string;
}

function Class() {
  const [comments, setComments] = useState("");
  const [checkedItems, setCheckedItems] = useState<CheckedItem[]>([]);
  const [currentDate, setCurrentDate] = useState("");

  const [currentClassData, setCurrentClassData] = useLocalStorage<Class | null>(
    "currentClass",
    null,
  );

  const [, setClasses] = useLocalStorage<Class[]>("classes", []);

  const [students] = useLocalStorage<Student[]>("students", []);
  const [lessons] = useLocalStorage<Lesson[]>("lessons", []);

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

  const navigate = useNavigate();

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
    if (currentClassData) {
      setCurrentClassData({
        ...currentClassData,
        date: value,
      });
    }
  }

  function handleFinish() {
    const data: Class = {
      ...currentClassData!,
      comments,
      completedItems: checkedItems,
    };

    setClasses((_classes) => [..._classes, data]);
    navigate("/");
  }

  useEffect(() => {
    if (currentClassData?.date) {
      setCurrentDate(currentClassData.date);
    }
  }, [currentClassData?.date]);

  return (
    <div className="md:px-24 px-6 py-12 space-y-4">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Nova Aula</h1>
        <Button onClick={handleFinish} disabled={noCheckedItems}>
          Finalizar Aula
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-100 flex items-center justify-between py-4 px-6 rounded-lg">
          <Label>Aluno selecionado: {student?.name}</Label>
        </div>

        <div className="flex items-center gap-2 w-full">
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => handleDateChange(e.target.value)}
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
      </div>
    </div>
  );
}

export type { CheckedItem };
export default Class;
