import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "@/components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { lessonCategories as classCategories } from "@/constants/lessonCategories";
import { formatTime } from "@/utils";
import { useCloudStorage } from "@/utils/storage";

import { Category, Lesson } from "./Lessons";
import type { Class } from "./NewClass";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const navigate = useNavigate();
  const { value: classes, loading: classesLoading } = useCloudStorage<Class[]>("classes", []);
  const { value: lessons, loading: lessonsLoading } = useCloudStorage<Lesson[]>("lessons", []);
  const { setValue: setCurrentClassData } = useCloudStorage<Class | null>(
    "currentClass",
    null,
  );


  // Group class by category
  const classByCategory = classes.reduce(
    (acc, _class) => {
      const category = classCategories.find(
        (cat) => cat.id === _class.categoryId,
      );

      if (category) {
        if (!acc[category.id]) {
          acc[category.id] = {
            category,
            classes: [],
          };
        }
        acc[category.id].classes.push(_class);
      } else {
        const uncategorizedId = "uncategorized";
        if (!acc[uncategorizedId]) {
          acc[uncategorizedId] = {
            category: {
              id: uncategorizedId,
              name: "Sem categoria",
              slug: "sem-categoria",
              description: "Aulas sem categoria definida",
            },
            classes: [],
          };
        }
        acc[uncategorizedId].classes.push(_class);
      }

      return acc;
    },
    {} as Record<string, { category: Category; classes: Class[] }>,
  );

  const filteredClasses = Object.entries(classByCategory)
    .map(([categoryId, { category, classes }]) => ({
      categoryId,
      category,
      classes: classes.filter((classData) => {
        const matchesSearch =
          classData.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lessons
            .find((l) => l.id === classData.lessonId)
            ?.title.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesDate = !searchDate || classData.date === searchDate;

        return matchesSearch && matchesDate;
      }),
    }))
    .filter(({ classes }) => classes.length > 0);

  function handleEditClass(classData: Class) {
    setCurrentClassData({
      ...classData,
      isEditing: true, // Flag para identificar modo de edição
    });
    navigate("/aula");
  }

  if (classesLoading || lessonsLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando aulas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-3xl">Aulas Realizadas</Label>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        date={searchDate}
        onDateChange={setSearchDate}
        showDateFilter
        placeholder="Aluno, título..."
      />

      {filteredClasses.length === 0 && (
        <p className="text-muted-foreground text-center">
          {searchTerm || searchDate
            ? "Nenhuma aula encontrada."
            : "As aulas aparecerão aqui."}
        </p>
      )}

      {filteredClasses.map(({ categoryId, category, classes }) => (
        <div key={categoryId}>
          <h2 className="text-xl font-semibold">{category.name}</h2>
          <Accordion type="single" collapsible className="mb-8">
            {classes.map((classData) => {
              const {
                id,
                date,
                completedItems,
                studentName,
                comments,
                lessonId,
                duration,
                teacherSignature,
                studentSignature,
              } = classData;

              const lesson = lessons.find((lesson) => lesson.id === lessonId);
              const formattedDate = new Date(
                date + "T00:00:00",
              ).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });

              return (
                <AccordionItem key={id} value={`item-${id}`}>
                  <AccordionTrigger className="text-start">
                    {formattedDate} - {studentName} - {lesson?.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      {completedItems?.map((completedItem, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 space-y-2"
                        >
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="mt-3"
                          />
                          <label>{completedItem.text}</label>
                        </div>
                      ))}
                    </div>

                    {!!duration && (
                      <div className="bg-muted px-2 py-3 rounded-lg text-muted-foreground">
                        <p className="font-medium">
                          Duração da aula: {formatTime(duration)}
                        </p>
                      </div>
                    )}

                    {!!comments?.length && (
                      <div className="bg-muted px-2 py-3 rounded-lg text-muted-foreground">
                        {comments}
                      </div>
                    )}

                    {(teacherSignature || studentSignature) && (
                      <div className="grid grid-cols-2 gap-4">
                        {teacherSignature && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Assinatura do Professor
                            </p>
                            <div className="border rounded-lg p-2 bg-white">
                              <img
                                src={teacherSignature}
                                alt="Assinatura do professor"
                                className="h-16 object-contain"
                              />
                            </div>
                          </div>
                        )}
                        {studentSignature && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Assinatura do Aluno
                            </p>
                            <div className="border rounded-lg p-2 bg-white">
                              <img
                                src={studentSignature}
                                alt="Assinatura do aluno"
                                className="h-16 object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditClass(classData)}
                    >
                      Editar Aula
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

export default Home;
