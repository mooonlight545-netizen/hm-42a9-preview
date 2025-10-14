import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

interface SortableVerseProps {
  id: string;
  text: string;
}

function SortableVerse({ id, text }: SortableVerseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-3 cursor-move hover:border-primary/50 transition-colors"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div dir="rtl" className="arabic-text text-xl flex-1">
          {text}
        </div>
      </div>
    </Card>
  );
}

interface ReorderQuestionProps {
  verses: string[];
  revealed: boolean;
  correctOrder: string[];
}

export function ReorderQuestion({ verses, revealed, correctOrder }: ReorderQuestionProps) {
  const [items, setItems] = useState(() =>
    verses.map((text, i) => ({ id: `verse-${i}`, text }))
  );
  
  const prevVersesRef = useRef<string[]>([]);

  // Only update items when verses content actually changes (new question)
  // Not when revealed changes
  useEffect(() => {
    const versesChanged = 
      verses.length !== prevVersesRef.current.length ||
      verses.some((text, i) => text !== prevVersesRef.current[i]);
    
    if (versesChanged) {
      setItems(verses.map((text, i) => ({ id: `verse-${i}`, text })));
      prevVersesRef.current = verses;
    }
  }, [verses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (revealed) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Order:</h4>
          <div className="space-y-3">
            {items.map((item, i) => {
              const isCorrect = item.text === correctOrder[i];
              return (
                <Card 
                  key={item.id} 
                  className={`p-4 ${isCorrect ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                      {i + 1}
                    </div>
                    <div dir="rtl" className="arabic-text text-xl flex-1">
                      {item.text}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Correct Order:</h4>
          <div className="space-y-3">
            {correctOrder.map((text, i) => (
              <Card key={i} className="p-4 border-success/50 bg-success/5">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center text-success text-sm font-semibold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div dir="rtl" className="arabic-text text-xl flex-1">
                    {text}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>
          {items.map((item) => (
            <SortableVerse key={item.id} id={item.id} text={item.text} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
