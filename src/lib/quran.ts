/**
 * Quran Data Utilities
 * 
 * This module provides centralized access to Qur'an data including:
 * - Arabic text (Imla'i script)
 * - English translation (Saheeh International)
 * - Juz boundaries
 * - Navigation helpers (next/prev verse)
 * - Random verse selection
 */

// Types
export type VerseKey = `${number}:${number}`;

export interface VerseData {
  ar: string;        // Arabic text
  en: string;        // English translation
  surah: number;
  ayah: number;
}

export interface JuzRange {
  juz: number;
  start: VerseKey;
  end: VerseKey;
}

export interface SurahInfo {
  number: number;
  name: string;
  ayahCount: number;
}

// Surah names in English
const SURAH_NAMES: Record<number, string> = {
  1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 4: "An-Nisa", 5: "Al-Ma'idah",
  6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Tawbah", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
  16: "An-Nahl", 17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Taha",
  21: "Al-Anbya", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur", 25: "Al-Furqan",
  26: "Ash-Shu'ara", 27: "An-Naml", 28: "Al-Qasas", 29: "Al-'Ankabut", 30: "Ar-Rum",
  31: "Luqman", 32: "As-Sajdah", 33: "Al-Ahzab", 34: "Saba", 35: "Fatir",
  36: "Ya-Sin", 37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Ash-Shuraa", 43: "Az-Zukhruf", 44: "Ad-Dukhan", 45: "Al-Jathiyah",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujurat", 50: "Qaf",
  51: "Adh-Dhariyat", 52: "At-Tur", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman",
  56: "Al-Waqi'ah", 57: "Al-Hadid", 58: "Al-Mujadila", 59: "Al-Hashr", 60: "Al-Mumtahanah",
  61: "As-Saf", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Taghabun", 65: "At-Talaq",
  66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haqqah", 70: "Al-Ma'arij",
  71: "Nuh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddaththir", 75: "Al-Qiyamah",
  76: "Al-Insan", 77: "Al-Mursalat", 78: "An-Naba", 79: "An-Nazi'at", 80: "'Abasa",
  81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaq", 85: "Al-Buruj",
  86: "At-Tariq", 87: "Al-A'la", 88: "Al-Ghashiyah", 89: "Al-Fajr", 90: "Al-Balad",
  91: "Ash-Shams", 92: "Al-Layl", 93: "Ad-Duhaa", 94: "Ash-Sharh", 95: "At-Tin",
  96: "Al-'Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-'Adiyat",
  101: "Al-Qari'ah", 102: "At-Takathur", 103: "Al-'Asr", 104: "Al-Humazah", 105: "Al-Fil",
  106: "Quraysh", 107: "Al-Ma'un", 108: "Al-Kawthar", 109: "Al-Kafirun", 110: "An-Nasr",
  111: "Al-Masad", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas"
};

// Ayah counts per surah
const AYAH_COUNTS: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

// Data cache
let arabicData: Record<string, { id: number; verse_key: string; surah: number; ayah: number; text: string }> | null = null;
let translationData: Record<string, { t: string }> | null = null;
let juzRanges: JuzRange[] | null = null;

/**
 * Load Arabic verses data
 */
async function loadArabicData() {
  if (arabicData) return arabicData;
  const response = await fetch('/data/imlaei-script-ayah-by-ayah.json');
  arabicData = await response.json();
  return arabicData;
}

/**
 * Load translation data
 */
async function loadTranslationData() {
  if (translationData) return translationData;
  const response = await fetch('/data/en-sahih-international-simple.json');
  translationData = await response.json();
  return translationData;
}

/**
 * Parse CSV and load Juz ranges
 */
async function loadJuzRanges(): Promise<JuzRange[]> {
  if (juzRanges) return juzRanges;
  
  const response = await fetch('/data/juz_breakdown_standard.csv');
  const text = await response.text();
  const lines = text.trim().split('\n').slice(1); // Skip header
  
  juzRanges = lines.map(line => {
    const [juz, startSurah, startAyah, endSurah, endAyah] = line.split(',').map(Number);
    return {
      juz,
      start: `${startSurah}:${startAyah}` as VerseKey,
      end: `${endSurah}:${endAyah}` as VerseKey
    };
  });
  
  return juzRanges;
}

/**
 * Create a verse key from surah and ayah numbers
 */
export function getVerseKey(surah: number, ayah: number): VerseKey {
  return `${surah}:${ayah}`;
}

/**
 * Parse a verse key into surah and ayah numbers
 */
export function parseVerseKey(key: VerseKey): { surah: number; ayah: number } {
  const [surah, ayah] = key.split(':').map(Number);
  return { surah, ayah };
}

/**
 * Get a single verse by key
 */
export async function getVerseByKey(key: VerseKey): Promise<VerseData | null> {
  const [arabic, translation] = await Promise.all([loadArabicData(), loadTranslationData()]);
  
  const arVerse = arabic[key];
  const enVerse = translation[key];
  
  if (!arVerse) return null;
  
  return {
    ar: arVerse.text,
    en: enVerse?.t || '',
    surah: arVerse.surah,
    ayah: arVerse.ayah
  };
}

/**
 * Get the next verse after the given key
 * Handles surah boundaries correctly
 */
export function getNext(key: VerseKey): VerseKey | null {
  const { surah, ayah } = parseVerseKey(key);
  
  // Check if we're at the end of current surah
  if (ayah >= AYAH_COUNTS[surah]) {
    // Move to next surah
    if (surah >= 114) return null; // End of Quran
    return getVerseKey(surah + 1, 1);
  }
  
  return getVerseKey(surah, ayah + 1);
}

/**
 * Get the previous verse before the given key
 * Handles surah boundaries correctly
 */
export function getPrev(key: VerseKey): VerseKey | null {
  const { surah, ayah } = parseVerseKey(key);
  
  // Check if we're at the start of current surah
  if (ayah <= 1) {
    // Move to previous surah
    if (surah <= 1) return null; // Start of Quran
    const prevSurah = surah - 1;
    return getVerseKey(prevSurah, AYAH_COUNTS[prevSurah]);
  }
  
  return getVerseKey(surah, ayah - 1);
}

/**
 * Get Juz range by number (1-30)
 */
export async function getRangeForJuz(juz: number): Promise<{ start: VerseKey; end: VerseKey }> {
  const ranges = await loadJuzRanges();
  const range = ranges.find(r => r.juz === juz);
  if (!range) throw new Error(`Juz ${juz} not found`);
  return { start: range.start, end: range.end };
}

/**
 * Check if a verse key is within a range (inclusive)
 */
function isInRange(key: VerseKey, start: VerseKey, end: VerseKey): boolean {
  const { surah: s, ayah: a } = parseVerseKey(key);
  const { surah: startS, ayah: startA } = parseVerseKey(start);
  const { surah: endS, ayah: endA } = parseVerseKey(end);
  
  if (s < startS || s > endS) return false;
  if (s === startS && a < startA) return false;
  if (s === endS && a > endA) return false;
  return true;
}

/**
 * Get all verse keys in a range
 */
export function getAllKeysInRange(start: VerseKey, end: VerseKey): VerseKey[] {
  const keys: VerseKey[] = [];
  let current: VerseKey | null = start;
  
  const { surah: endSurah, ayah: endAyah } = parseVerseKey(end);
  
  while (current) {
    keys.push(current);
    
    const { surah, ayah } = parseVerseKey(current);
    if (surah === endSurah && ayah === endAyah) {
      break;
    }
    
    current = getNext(current);
    
    // Safety check to prevent infinite loops
    if (current) {
      const { surah: nextSurah, ayah: nextAyah } = parseVerseKey(current);
      if (nextSurah > endSurah || (nextSurah === endSurah && nextAyah > endAyah)) {
        break;
      }
    }
  }
  
  return keys;
}

/**
 * Select a random verse within the specified scope
 */
export async function randomVerse(scope:
  | { type: 'full' }
  | { type: 'juz'; juz: number }
  | { type: 'surah'; surah: number }
): Promise<VerseKey> {
  let start: VerseKey, end: VerseKey;
  
  if (scope.type === 'full') {
    start = '1:1';
    end = '114:6';
  } else if (scope.type === 'juz') {
    const range = await getRangeForJuz(scope.juz);
    start = range.start;
    end = range.end;
  } else {
    start = getVerseKey(scope.surah, 1);
    end = getVerseKey(scope.surah, AYAH_COUNTS[scope.surah]);
  }
  
  const allKeys = getAllKeysInRange(start, end);
  return allKeys[Math.floor(Math.random() * allKeys.length)];
}

/**
 * Get consecutive verses starting from a key
 * Returns an array of verse keys
 */
export function consecutive(key: VerseKey, count: number, maxKey?: VerseKey): VerseKey[] {
  const result: VerseKey[] = [key];
  let current = key;
  
  for (let i = 1; i < count; i++) {
    const next = getNext(current);
    if (!next) break;
    
    // Stop if we exceed the maximum key
    if (maxKey) {
      const { surah: nextSurah, ayah: nextAyah } = parseVerseKey(next);
      const { surah: maxSurah, ayah: maxAyah } = parseVerseKey(maxKey);
      if (nextSurah > maxSurah || (nextSurah === maxSurah && nextAyah > maxAyah)) {
        break;
      }
    }
    
    result.push(next);
    current = next;
  }
  
  return result;
}

/**
 * Get surah name by number
 */
export function getSurahName(surah: number): string {
  return SURAH_NAMES[surah] || `Surah ${surah}`;
}

/**
 * Get surah info
 */
export function getSurahInfo(surah: number): SurahInfo {
  return {
    number: surah,
    name: getSurahName(surah),
    ayahCount: AYAH_COUNTS[surah] || 0
  };
}

/**
 * Get all surah info (for dropdowns)
 */
export function getAllSurahs(): SurahInfo[] {
  return Object.keys(SURAH_NAMES).map(num => getSurahInfo(Number(num)));
}

/**
 * Split Arabic text into words for partial masking
 */
export function splitArabicWords(text: string): string[] {
  return text.trim().split(/\s+/);
}

/**
 * Mask a portion of Arabic text (for beginning/ending completion modes)
 * @param text Arabic text
 * @param portion 'beginning' or 'ending'
 * @param percentage Percentage to mask (e.g., 0.25 for 25%)
 */
export function maskText(text: string, portion: 'beginning' | 'ending', percentage: number = 0.25): string {
  const words = splitArabicWords(text);
  const maskCount = Math.ceil(words.length * percentage);
  
  if (portion === 'beginning') {
    const masked = Array(maskCount).fill('...').join(' ');
    const visible = words.slice(maskCount).join(' ');
    return `${masked} ${visible}`;
  } else {
    const visible = words.slice(0, words.length - maskCount).join(' ');
    const masked = Array(maskCount).fill('...').join(' ');
    return `${visible} ${masked}`;
  }
}
