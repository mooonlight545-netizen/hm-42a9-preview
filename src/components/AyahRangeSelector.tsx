import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export interface AyahRange {
  enabled: boolean;
  start: number;
  end: number;
}

interface AyahRangeSelectorProps {
  surahNumber: number;
  totalAyahs: number;
  value: AyahRange;
  onChange: (range: AyahRange) => void;
}

/**
 * Ayah Range Selector Component
 * 
 * Allows users to select a specific range of ayat within a surah.
 * Only displayed when "Specific Surah" scope is selected.
 */
export function AyahRangeSelector({ surahNumber, totalAyahs, value, onChange }: AyahRangeSelectorProps) {
  const handleEnabledChange = (enabled: boolean) => {
    if (!enabled) {
      onChange({ enabled: false, start: 1, end: totalAyahs });
    } else {
      onChange({ ...value, enabled: true });
    }
  };

  const ayahNumbers = Array.from({ length: totalAyahs }, (_, i) => i + 1);

  return (
    <Card className="p-4 space-y-4">
      <Label className="text-base font-semibold">Ayah Range</Label>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-ayat"
            checked={!value.enabled}
            onCheckedChange={(checked) => handleEnabledChange(!checked)}
          />
          <Label htmlFor="all-ayat" className="cursor-pointer font-normal">
            All Ayat
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="choose-ayat"
            checked={value.enabled}
            onCheckedChange={(checked) => handleEnabledChange(!!checked)}
          />
          <Label htmlFor="choose-ayat" className="cursor-pointer font-normal">
            Choose Ayat
          </Label>
        </div>
      </div>

      {value.enabled && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <Label htmlFor="start-ayah" className="text-sm mb-2 block">
              From Ayah
            </Label>
            <Select
              value={value.start.toString()}
              onValueChange={(v) => onChange({ ...value, start: Number(v) })}
            >
              <SelectTrigger id="start-ayah">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-popover">
                {ayahNumbers.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="end-ayah" className="text-sm mb-2 block">
              To Ayah
            </Label>
            <Select
              value={value.end.toString()}
              onValueChange={(v) => onChange({ ...value, end: Number(v) })}
            >
              <SelectTrigger id="end-ayah">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-popover">
                {ayahNumbers.filter(n => n >= value.start).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
}
