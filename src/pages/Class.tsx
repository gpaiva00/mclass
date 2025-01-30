import { Clock, Pause, Play, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { lessonCategories } from "@/constants/lessonCategories";
import { formatTime, useLocalStorage } from "@/utils";

import type { Lesson } from "./Lessons";
import type { Class } from "./NewClass";
import type { Student } from "./Students";

interface CheckedItem {
  id: string;
  text: string;
}

interface Timer {
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  isRunning: boolean;
}

interface Signature {
  teacher: string;
  student: string;
}

function Class() {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout>();

  const [currentClassData] = useLocalStorage<Class | null>(
    "currentClass",
    null,
  );
  const [, setClasses] = useLocalStorage<Class[]>("classes", []);
  const [students] = useLocalStorage<Student[]>("students", []);
  const [lessons] = useLocalStorage<Lesson[]>("lessons", []);

  const [comments, setComments] = useState(currentClassData?.comments || "");
  const [checkedItems, setCheckedItems] = useState<CheckedItem[]>(
    currentClassData?.completedItems || [],
  );
  const [currentDate, setCurrentDate] = useState(() => {
    if (currentClassData?.date) return currentClassData.date;
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [timer, setTimer] = useState<Timer>({
    startTime: currentClassData?.startTime || "",
    endTime: currentClassData?.endTime || "",
    duration: currentClassData?.duration || 0,
    isRunning: false,
  });

  const [signatures, setSignatures] = useState<Signature>({
    teacher: currentClassData?.teacherSignature || "",
    student: currentClassData?.studentSignature || "",
  });

  const student = students.find(
    (_student) => _student.id === currentClassData?.studentId,
  );
  const lesson = lessons.find(
    (_lesson) => _lesson.id === currentClassData?.lessonId,
  );
  const isEditing = currentClassData?.isEditing;

  const noCheckedItems = useMemo(
    () => Object.values(checkedItems).every((value) => !value),
    [checkedItems],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function handleStartTimer() {
    if (!timer.startTime) {
      setTimer((prev) => ({
        ...prev,
        startTime: new Date().toISOString(),
        isRunning: true,
      }));
    } else {
      setTimer((prev) => ({ ...prev, isRunning: true }));
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  }

  function handlePauseTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer((prev) => ({ ...prev, isRunning: false }));
  }

  function handleStopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer((prev) => ({
      ...prev,
      endTime: new Date().toISOString(),
      isRunning: false,
    }));
  }

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

  function handleSignatureChange(type: "teacher" | "student", value: string) {
    setSignatures((prev) => ({ ...prev, [type]: value }));
  }

  function handleFinish() {
    if (timer.isRunning) {
      handleStopTimer();
    }

    const updatedClassData: Class = {
      ...currentClassData!,
      comments,
      completedItems: checkedItems,
      date: currentDate,
      startTime: timer.startTime,
      endTime: timer.endTime,
      duration: timer.duration,
      teacherSignature: signatures.teacher,
      studentSignature: signatures.student,
    };

    if (isEditing) {
      setClasses((_classes) =>
        _classes.map((c) =>
          c.id === currentClassData?.id ? updatedClassData : c,
        ),
      );
    } else {
      setClasses((_classes) => [..._classes, updatedClassData]);
    }

    navigate("/");
  }

  function handleRemoveClass() {
    setClasses((prev) => prev.filter(({ id }) => id !== currentClassData?.id));
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-md flex items-center gap-2">
            <Clock className="h-5 w-5" /> Timer da Aula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-mono text-center">
            {formatTime(timer.duration)}
          </div>
          <div className="flex justify-center gap-2">
            {!timer.isRunning ? (
              <Button onClick={handleStartTimer} className="w-24">
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            ) : (
              <Button onClick={handlePauseTimer} className="w-24">
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            )}
            <Button
              onClick={handleStopTimer}
              variant="outline"
              className="w-24"
            >
              <Square className="h-4 w-4 mr-2" />
              Parar
            </Button>
          </div>
        </CardContent>
      </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-md">Assinaturas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Assinatura do Professor</Label>
              <Input
                value={signatures.teacher}
                onChange={(e) =>
                  handleSignatureChange("teacher", e.target.value)
                }
                placeholder="Digite seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Assinatura do Aluno</Label>
              <Input
                value={signatures.student}
                onChange={(e) =>
                  handleSignatureChange("student", e.target.value)
                }
                placeholder="Digite o nome completo do aluno"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            onClick={handleFinish}
            disabled={noCheckedItems}
            className="w-full"
          >
            {isEditing ? "Salvar Alterações" : "Finalizar Aula"}
          </Button>
          {isEditing && (
            <Button
              variant="link"
              className="text-red-500 w-full"
              onClick={handleRemoveClass}
            >
              Apagar Aula
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { CheckedItem };
export default Class;
