import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  AlignRight,
  ListOrdered,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Eye,
  Languages,
  BookMarked,
  Volume2,
  Link,
  Link2,
  Hash,
  AlertCircle,
  Search
} from "lucide-react";

export type QuizMode = 
  | 'beginning'
  | 'ending'
  | 'missing'
  | 'reorder'
  | 'next'
  | 'previous'
  | 'partial'
  | 'next-three'
  | 'translation'
  | 'guess-surah'
  | 'help-imam'
  | 'chaining-surah'
  | 'chaining-surah-reverse'
  | 'ayah-number'
  | 'what-doesnt-belong'
  | 'what-is-x';

interface QuizModeSelectorProps {
  value: QuizMode;
  onChange: (mode: QuizMode) => void;
  scopeType: 'full' | 'juz' | 'surah';
}

/**
 * Quiz Mode Selector Component
 * 
 * Displays 8 quiz mode buttons.
 * "Guess Surah" is only enabled for Full Qur'an or Juz scope.
 */
export function QuizModeSelector({ value, onChange, scopeType }: QuizModeSelectorProps) {
  const modes: Array<{
    id: QuizMode;
    label: string;
    icon: typeof AlignLeft;
    disabled?: boolean;
  }> = [
    { id: 'beginning', label: 'Beginning Completion', icon: AlignLeft },
    { id: 'ending', label: 'Ending Completion', icon: AlignRight },
    { id: 'missing', label: 'Missing Verse', icon: ListOrdered },
    { id: 'reorder', label: 'Order Rearrange', icon: Shuffle },
    { id: 'next', label: 'Next Ayah', icon: ChevronRight },
    { id: 'previous', label: 'Previous Ayah', icon: ChevronLeft },
    { id: 'partial', label: 'Partial Reveal', icon: Eye },
    { id: 'next-three', label: 'Next 3 Ayat', icon: ChevronRight },
    { id: 'translation', label: 'Translation', icon: Languages },
    { 
      id: 'guess-surah', 
      label: 'Guess Surah', 
      icon: BookMarked,
      disabled: scopeType === 'surah'
    },
    { id: 'help-imam', label: 'Help the Imam', icon: Volume2 },
    { id: 'chaining-surah', label: 'Chaining Surah', icon: Link },
    { id: 'chaining-surah-reverse', label: 'Chaining Surah Reverse', icon: Link2 },
    { id: 'ayah-number', label: 'Ayah Number Guess', icon: Hash },
    { id: 'what-doesnt-belong', label: "What Doesn't Belong", icon: AlertCircle },
    { 
      id: 'what-is-x', 
      label: 'What is X Ayah?', 
      icon: Search,
      disabled: scopeType !== 'surah'
    },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Quiz Mode</Label>
      <div className="grid grid-cols-1 gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.id;
          const isDisabled = mode.disabled;
          
          return (
            <Button
              key={mode.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "justify-start gap-3 h-auto py-3",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onChange(mode.id)}
              disabled={isDisabled}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{mode.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
