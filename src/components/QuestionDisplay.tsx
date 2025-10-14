import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/hooks/useQuiz";
import { Separator } from "@/components/ui/separator";
import { ReorderQuestion } from "./ReorderQuestion";
import { AudioPlayer } from "./AudioPlayer";

interface QuestionDisplayProps {
  question: QuizQuestion | null;
  revealed: boolean;
  loading: boolean;
  onGenerate: () => void;
  onReveal: () => void;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Question Display Component
 * 
 * Shows the current quiz question with controls:
 * - Generate Next
 * - Reveal Answer
 * - Correct / Wrong buttons
 * 
 * After reveal, shows full answer and metadata.
 */
export function QuestionDisplay({
  question,
  revealed,
  loading,
  onGenerate,
  onReveal,
  onCorrect,
  onWrong
}: QuestionDisplayProps) {
  if (!question) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground text-center">
          Select a quiz mode and scope, then generate your first question.
        </p>
        <Button onClick={onGenerate} disabled={loading} size="lg" className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ChevronRight className="h-5 w-5" />
              Generate Question
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Question Text */}
      <div className="min-h-[200px]">
        {question.mode === 'reorder' ? (
          <ReorderQuestion
            verses={JSON.parse(question.displayText)}
            revealed={revealed}
            correctOrder={JSON.parse(question.answer)}
          />
        ) : question.mode === 'help-imam' && question.audio ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="text-xl md:text-2xl text-center font-semibold max-w-2xl">
              Imagine you're in Taraweeh — Listen to 3 ayat, what 2 ayat comes next?
            </div>
            <AudioPlayer 
              segments={question.audio.segments}
              className="mt-4"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[200px]">
            <div 
              dir="rtl" 
              className="arabic-text text-2xl md:text-3xl text-center leading-relaxed px-4"
            >
              {question.displayText.split('\n\n').map((line, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode-specific instructions */}
      {!revealed && (
        <div className="text-center text-sm text-muted-foreground">
          {getModeInstruction(question.mode)}
        </div>
      )}

      {/* Revealed Answer Section */}
      {revealed && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Answer:</h3>
            
            {/* Arabic answer */}
            {question.mode !== 'translation' && question.mode !== 'guess-surah' && question.mode !== 'reorder' && (
              <div 
                dir="rtl" 
                className="arabic-text text-2xl text-center p-6 bg-muted/30 rounded-lg leading-relaxed"
              >
                {question.answer.split('\n\n').map((line, i) => (
                  <div key={i} className="mb-6 last:mb-0">
                    {line}
                  </div>
                ))}
              </div>
            )}
            
            {/* Help the Imam mode - show audio and answer ranges */}
            {question.mode === 'help-imam' && question.metadata?.audioRange && (
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <div>Audio played: {question.metadata.audioRange}</div>
                <div className="font-semibold">The next 2 ayat:</div>
              </div>
            )}

            {/* English translation */}
            {question.mode === 'translation' && (
              <div className="text-lg p-4 bg-muted/30 rounded-lg">
                {question.answer}
              </div>
            )}

            {/* Surah name */}
            {question.mode === 'guess-surah' && (
              <div className="text-xl font-semibold text-center p-4 bg-muted/30 rounded-lg">
                {question.answer}
                {question.metadata?.verseRange && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Ayat: {question.metadata.verseRange}
                  </div>
                )}
              </div>
            )}

            {/* Additional metadata */}
            {question.metadata?.translation && question.mode !== 'translation' && (
              <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg">
                <span className="font-medium">Translation: </span>
                {question.metadata.translation}
              </div>
            )}

            {question.metadata?.verseRange && question.mode !== 'guess-surah' && (
              <div className="text-sm text-muted-foreground">
                Ayah range: {question.metadata.verseRange}
              </div>
            )}
            
            {question.mode === 'what-doesnt-belong' && question.metadata?.correctAyahsInfo && (
              <div className="text-sm text-muted-foreground mt-2">
                <div className="font-medium">Correct ayat:</div>
                <div>{question.metadata.correctAyahsInfo}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button 
          onClick={onGenerate} 
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Generate Next
        </Button>

        {!revealed ? (
          <Button 
            onClick={onReveal}
            variant="secondary"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Reveal Answer
          </Button>
        ) : (
          <>
            <Button 
              onClick={onCorrect}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4" />
              Correct
            </Button>
            <Button 
              onClick={onWrong}
              variant="destructive"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Wrong
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * Get instruction text for each quiz mode
 */
function getModeInstruction(mode: string): string {
  const instructions: Record<string, string> = {
    'beginning': 'Complete the beginning of this verse from memory',
    'ending': 'Complete the ending of this verse from memory',
    'missing': 'Identify which verse is missing from this sequence',
    'reorder': 'Arrange these verses in the correct order',
    'next': 'What is the next ayah after this verse?',
    'previous': 'What is the previous ayah before this verse?',
    'partial': 'Complete the concealed parts of this verse from memory',
    'next-three': 'What are the next three ayat after this verse?',
    'translation': 'What is the English translation of this verse?',
    'guess-surah': 'Which Surah do these verses come from?',
    'help-imam': 'Listen carefully to the recitation and recall what comes next. If the audio ends at the final ayah(s) of a surah, the answer continues from the beginning of the next surah.',
    'chaining-surah': 'This is the last ayah of a surah. What is the first ayah of the next surah?',
    'chaining-surah-reverse': 'This is the first ayah of a surah. What is the last ayah of the previous surah?',
    'ayah-number': 'What is the ayah number of this verse within its surah?',
    'what-doesnt-belong': 'One of these four ayat doesn\'t belong to this surah. Which one is it?',
    'what-is-x': 'Recall the requested ayah from the surah'
  };
  
  return instructions[mode] || '';
}
