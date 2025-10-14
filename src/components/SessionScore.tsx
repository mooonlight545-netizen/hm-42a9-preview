import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface SessionScoreProps {
  correct: number;
  wrong: number;
}

/**
 * Session Score Widget
 * 
 * Displays current session statistics:
 * - Total answered
 * - Correct count
 * - Accuracy percentage
 */
export function SessionScore({ correct, wrong }: SessionScoreProps) {
  const total = correct + wrong;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Session Score</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Answered</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-2xl font-bold text-success">{correct}</span>
          </div>
          <div className="text-xs text-muted-foreground">Correct</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">{percentage}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
      </div>
    </Card>
  );
}
