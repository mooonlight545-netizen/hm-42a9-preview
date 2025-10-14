import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScopeSelector, type ScopeSelection } from "@/components/ScopeSelector";
import { QuizModeSelector, type QuizMode } from "@/components/QuizModeSelector";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { AyahRangeSelector, type AyahRange } from "@/components/AyahRangeSelector";
import { Card } from "@/components/ui/card";
import { useQuiz } from "@/hooks/useQuiz";
import { getSurahInfo } from "@/lib/quran";

/**
 * Main Testing Page
 * 
 * Two-column layout:
 * - Left: Configuration (scope, mode, score)
 * - Right: Question display and controls
 */
export default function Test() {
  const [scope, setScope] = useState<ScopeSelection>({ type: 'full' });
  const [mode, setMode] = useState<QuizMode>('beginning');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [ayahRange, setAyahRange] = useState<AyahRange>({ 
    enabled: false, 
    start: 1, 
    end: 1 
  });

  const { question, revealed, loading, generateQuestion, revealAnswer, reset } = useQuiz();

  // Get current surah info for ayah range
  const currentSurah = scope.type === 'surah' && scope.surah 
    ? getSurahInfo(scope.surah) 
    : null;

  const handleGenerate = () => {
    const range = scope.type === 'surah' && ayahRange.enabled
      ? { start: ayahRange.start, end: ayahRange.end }
      : undefined;
    generateQuestion(mode, scope, range);
  };

  const handleCorrect = () => {
    setCorrect(prev => prev + 1);
    const range = scope.type === 'surah' && ayahRange.enabled
      ? { start: ayahRange.start, end: ayahRange.end }
      : undefined;
    generateQuestion(mode, scope, range);
  };

  const handleWrong = () => {
    setWrong(prev => prev + 1);
    const range = scope.type === 'surah' && ayahRange.enabled
      ? { start: ayahRange.start, end: ayahRange.end }
      : undefined;
    generateQuestion(mode, scope, range);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[350px,1fr] gap-6">
          {/* Left Panel: Configuration */}
          <div className="space-y-6">
            <Card className="p-6">
              <ScopeSelector value={scope} onChange={setScope} />
            </Card>

            <Card className="p-6">
              <QuizModeSelector 
                value={mode} 
                onChange={setMode}
                scopeType={scope.type}
              />
            </Card>

            {scope.type === 'surah' && currentSurah && 
             !['help-imam', 'chaining-surah', 'chaining-surah-reverse', 'what-doesnt-belong', 'what-is-x'].includes(mode) && (
              <AyahRangeSelector
                surahNumber={currentSurah.number}
                totalAyahs={currentSurah.ayahCount}
                value={ayahRange}
                onChange={setAyahRange}
              />
            )}
          </div>

          {/* Right Panel: Progress & Question Display */}
          <div className="space-y-6">
            <ProgressBar correct={correct} wrong={wrong} />
            
            <QuestionDisplay
              question={question}
              revealed={revealed}
              loading={loading}
              onGenerate={handleGenerate}
              onReveal={revealAnswer}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
