import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { lessonCategories as classCategories } from "@/constants/lessonCategories";
import { useLocalStorage } from "@/utils/storage";

import { Category, Lesson } from "./Lessons";
import type { Class } from "./NewClass";

function Home() {
  // const navigate = useNavigate();

  const [classes, setClasses] = useLocalStorage<Class[]>("classes", []);
  const [lessons] = useLocalStorage<Lesson[]>("lessons", []);

  // Group class by category
  const classByCategory = classes.reduce(
    (acc, _class) => {
      const category = classCategories.find(
        (cat) => cat.id === _class.categoryId,
      );

      if (category) {
        // Aula com categoria
        if (!acc[category.id]) {
          acc[category.id] = {
            category,
            classes: [],
          };
        }
        acc[category.id].classes.push(_class);
      } else {
        // Aula sem categoria
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

  function handleRemoveClass(_id: string) {
    setClasses((prev) => prev.filter(({ id }) => id !== _id));
  }

  return (
    <div className="container space-y-8">
      <div className="w-full items-center flex justify-between">
        <Label className="text-3xl">Aulas Feitas</Label>
      </div>

      {!classes.length && (
        <p className="text-muted-foreground text-center">
          As aulas aparecerão aqui.
        </p>
      )}

      {Object.entries(classByCategory).map(
        ([categoryId, { category, classes }]) => (
          <div key={categoryId} className="space-y-4">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Accordion type="single" collapsible className="mb-8">
              {classes.map(
                ({
                  id,
                  date,
                  completedItems,
                  studentName,
                  comments,
                  lessonId,
                }) => {
                  const lesson = lessons.find(
                    (lesson) => lesson.id === lessonId,
                  );

                  const formattedDate = new Date(
                    date + "T00:00:00",
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  });

                  return (
                    <AccordionItem key={id} value={`item-${id}`}>
                      <AccordionTrigger>
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
                                className="mt-3"
                              />
                              <label>{completedItem.text}</label>
                            </div>
                          ))}
                        </div>

                        {!!comments.length && (
                          <div className="bg-muted px-2 py-3 rounded-lg text-muted-foreground">
                            {comments}
                          </div>
                        )}
                        <Button
                          variant="link"
                          className="w-full text-red-500"
                          onClick={() => handleRemoveClass(id)}
                        >
                          Apagar Aula
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  );
                },
              )}
            </Accordion>
          </div>
        ),
      )}
    </div>
  );
}

export default Home;
