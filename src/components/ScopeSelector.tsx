import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllSurahs } from "@/lib/quran";
import type { SurahInfo } from "@/lib/quran";

export type ScopeType = 'full' | 'juz' | 'surah';

export interface ScopeSelection {
  type: ScopeType;
  juz?: number;
  surah?: number;
}

interface ScopeSelectorProps {
  value: ScopeSelection;
  onChange: (scope: ScopeSelection) => void;
}

/**
 * Scope Selector Component
 * 
 * Allows user to select testing scope:
 * - Full Qur'an
 * - Specific Juz (1-30)
 * - Specific Surah (1-114)
 */
export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);

  useEffect(() => {
    setSurahs(getAllSurahs());
  }, []);

  const handleTypeChange = (type: ScopeType) => {
    if (type === 'full') {
      onChange({ type: 'full' });
    } else if (type === 'juz') {
      onChange({ type: 'juz', juz: 1 });
    } else {
      onChange({ type: 'surah', surah: 1 });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Testing Scope</Label>
        <RadioGroup value={value.type} onValueChange={(v) => handleTypeChange(v as ScopeType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="scope-full" />
            <Label htmlFor="scope-full" className="cursor-pointer">Full Quran</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="juz" id="scope-juz" />
            <Label htmlFor="scope-juz" className="cursor-pointer">Specific Juz</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="surah" id="scope-surah" />
            <Label htmlFor="scope-surah" className="cursor-pointer">Specific Surah</Label>
          </div>
        </RadioGroup>
      </div>

      {value.type === 'juz' && (
        <div>
          <Label htmlFor="juz-select" className="text-sm mb-2 block">Select Juz</Label>
          <Select
            value={value.juz?.toString()}
            onValueChange={(v) => onChange({ type: 'juz', juz: Number(v) })}
          >
            <SelectTrigger id="juz-select">
              <SelectValue placeholder="Choose a Juz" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-popover">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                <SelectItem key={juz} value={juz.toString()}>
                  Juz {juz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {value.type === 'surah' && (
        <div>
          <Label htmlFor="surah-select" className="text-sm mb-2 block">Select Surah</Label>
          <Select
            value={value.surah?.toString()}
            onValueChange={(v) => onChange({ type: 'surah', surah: Number(v) })}
          >
            <SelectTrigger id="surah-select">
              <SelectValue placeholder="Choose a Surah" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-popover">
              {surahs.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
