import { nanoid } from "nanoid";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useLocalStorage } from "@/utils/storage";

import { Separator } from "@/components/ui/separator";
import { lessonCategories } from "@/constants/lessonCategories";

import type { CheckedItem } from "./Class";
import type { Category, Lesson } from "./Lessons";
import type { Student } from "./Students";

interface Class {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  comments: string;
  categoryId: string;
  date: string;
  completedItems?: CheckedItem[];
}

function NewClass() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [step, setStep] = useState(1);

  const [students] = useLocalStorage<Student[]>("students", []);
  const [lessons] = useLocalStorage<Lesson[]>("lessons", []);

  const [, setCurrentClassData] = useLocalStorage<Class | null>(
    "currentClass",
    null,
  );

  const navigate = useNavigate();

  // Group lessons by category
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
      }
      return acc;
    },
    {} as Record<string, { category: Category; lessons: Lesson[] }>,
  );

  function handleSelectStudent(student: Student) {
    setSelectedStudent(student);
    setStep(2);
  }

  function handleSelectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setStep(3);
  }

  function handleEditStudent() {
    setStep(1);
    setSelectedStudent(null);
  }

  function handleEditLesson() {
    setStep(2);
    setSelectedLesson(null);
  }

  function startClass() {
    if (!selectedLesson || !selectedStudent) return;

    setCurrentClassData({
      date: new Date().toLocaleDateString(),
      id: nanoid(7),
      lessonId: selectedLesson.id,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      categoryId: selectedLesson.categoryId,
      comments: "",
    });

    navigate("/aula");
  }

  return (
    <div className="container space-y-8">
      <div className="w-full items-center flex justify-between mb-8">
        <Label className="text-4xl">Nova Aula</Label>
        <Button disabled={step < 3} onClick={startClass}>
          Iniciar Aula
        </Button>
      </div>

      {selectedStudent && (
        <div className="bg-zinc-100 flex items-center justify-between py-2 px-4 rounded-lg">
          <Label>{selectedStudent.name}</Label>
          <Button variant="link" onClick={handleEditStudent}>
            Trocar
          </Button>
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Selecione um Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {students.map((student, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between w-full">
                  <Label className="text-lg">{student.name}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectStudent(student)}
                  >
                    Selecionar
                  </Button>
                </div>
                <Separator />
              </div>
            ))}
            {students.length === 0 && <p>Nenhum aluno cadastrado.</p>}
          </CardContent>
        </Card>
      )}

      {selectedLesson && step !== 2 && (
        <div className="bg-zinc-100 flex items-center justify-between py-2 px-4 rounded-lg">
          <Label>Plano de Aula: {selectedLesson.title}</Label>
          <Button variant="link" onClick={handleEditLesson}>
            Trocar
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">
              Selecione um Plano de Aula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 max-h-[600px] overflow-y-auto">
            {Object.entries(lessonsByCategory).map(
              ([categoryId, { category, lessons }]) => (
                <div key={categoryId} className="space-y-4">
                  <h2 className="text-xl font-semibold">{category.name}</h2>
                  <Accordion type="single" collapsible>
                    {lessons.map((lesson) => (
                      <AccordionItem key={lesson.id} value={lesson.id}>
                        <AccordionTrigger>{lesson.title}</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <ul className="space-y-2 list-disc list-inside">
                            {lesson.items.map((item) => (
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
                            className="w-full"
                            onClick={() => handleSelectLesson(lesson)}
                          >
                            Selecionar
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ),
            )}
            {lessons.length === 0 && <p>Nenhum plano de aulas cadastrado.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export type { Class };
export default NewClass;
