import { useState, useCallback } from 'react';
import type { QuizMode } from '@/components/QuizModeSelector';
import type { ScopeSelection } from '@/components/ScopeSelector';
import type { VerseKey, VerseData } from '@/lib/quran';
import {
  randomVerse,
  getVerseByKey,
  consecutive,
  getNext,
  getPrev,
  maskText,
  getSurahName,
  parseVerseKey,
  getAllKeysInRange,
  splitArabicWords,
  getVerseKey
} from '@/lib/quran';

/**
 * Quiz Question State
 */
export interface QuizQuestion {
  mode: QuizMode;
  verseKey: VerseKey;
  displayText: string;  // What user sees (may be masked/shuffled)
  answer: string;       // Correct answer
  options?: string[];   // For multiple choice (reorder, missing)
  metadata?: {
    surahName?: string;
    verseRange?: string;
    translation?: string;
    audioRange?: string;
    correctAyahsInfo?: string;
  };
  audio?: {
    segments: Array<{ start: number; end: number; audioUrl?: string }>;
  };
}

/**
 * useQuiz Hook
 * 
 * Manages quiz state and question generation for all modes.
 */
export function useQuiz() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Generate a new question based on mode and scope
   */
  const generateQuestion = useCallback(async (
    mode: QuizMode,
    scope: ScopeSelection,
    ayahRange?: { start: number; end: number }
  ): Promise<void> => {
    setLoading(true);
    setRevealed(false);

    try {
      // Select random verse within scope
      const scopeParam = 
        scope.type === 'full' ? { type: 'full' as const } :
        scope.type === 'juz' ? { type: 'juz' as const, juz: scope.juz! } :
        { type: 'surah' as const, surah: scope.surah! };
      
      let baseKey: VerseKey;
      let maxKey: VerseKey | undefined;
      
      // Handle ayah range for surah scope
      if (scope.type === 'surah' && ayahRange) {
        const startKey = getVerseKey(scope.surah!, ayahRange.start);
        const endKey = getVerseKey(scope.surah!, ayahRange.end);
        maxKey = endKey;
        const allKeys = getAllKeysInRange(startKey, endKey);
        baseKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      } else {
        baseKey = await randomVerse(scopeParam);
      }
      
      const verse = await getVerseByKey(baseKey);
      
      if (!verse) {
        throw new Error('Failed to load verse');
      }

      let newQuestion: QuizQuestion;

      switch (mode) {
        case 'beginning':
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: maskText(verse.ar, 'beginning'),
            answer: verse.ar,
            metadata: { 
              translation: verse.en,
              verseRange: baseKey
            }
          };
          break;

        case 'ending':
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: maskText(verse.ar, 'ending'),
            answer: verse.ar,
            metadata: { 
              translation: verse.en,
              verseRange: baseKey
            }
          };
          break;

        case 'missing': {
          // Get 4 consecutive verses, blank one randomly
          let keys = consecutive(baseKey, 4, maxKey);
          
          // If we don't have enough verses, try again
          if (keys.length < 4) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const verses = await Promise.all(keys.map(k => getVerseByKey(k)));
          const blankIndex = Math.floor(Math.random() * 4);
          
          const displayTexts = verses.map((v, i) => 
            i === blankIndex ? '...' : v?.ar || ''
          );
          
          newQuestion = {
            mode,
            verseKey: keys[blankIndex],
            displayText: displayTexts.join('\n\n'),
            answer: verses[blankIndex]?.ar || '',
            options: keys,
            metadata: { 
              translation: verses[blankIndex]?.en,
              verseRange: `${keys[0]} - ${keys[keys.length - 1]}`
            }
          };
          break;
        }

        case 'reorder': {
          // Get 5 consecutive verses and shuffle
          let keys = consecutive(baseKey, 5, maxKey);
          
          // If we don't have enough verses, try again
          if (keys.length < 5) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const verses = await Promise.all(keys.map(k => getVerseByKey(k)));
          const shuffled = [...verses].sort(() => Math.random() - 0.5);
          
          const { surah } = parseVerseKey(keys[0]);
          const surahName = getSurahName(surah);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: JSON.stringify(shuffled.map(v => v?.ar || '')),
            answer: JSON.stringify(verses.map(v => v?.ar || '')),
            options: keys,
            metadata: {
              surahName,
              verseRange: `${surahName}, ${keys[0]} – ${keys[keys.length - 1]}`
            }
          };
          break;
        }

        case 'next': {
          const nextKey = getNext(baseKey);
          if (!nextKey) {
            // Handle end of Quran - try again
            return generateQuestion(mode, scope, ayahRange);
          }
          const nextVerse = await getVerseByKey(nextKey);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verse.ar,
            answer: nextVerse?.ar || '',
            metadata: { 
              translation: verse.en,
              verseRange: `Question: ${baseKey}, Answer: ${nextKey}`
            }
          };
          break;
        }

        case 'previous': {
          const prevKey = getPrev(baseKey);
          if (!prevKey) {
            // Handle start of Quran - try again
            return generateQuestion(mode, scope, ayahRange);
          }
          const prevVerse = await getVerseByKey(prevKey);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verse.ar,
            answer: prevVerse?.ar || '',
            metadata: { 
              translation: verse.en,
              verseRange: `Question: ${baseKey}, Answer: ${prevKey}`
            }
          };
          break;
        }

        case 'partial': {
          // Randomly mask about half the words
          const words = splitArabicWords(verse.ar);
          const maskCount = Math.ceil(words.length * 0.5);
          const positions = new Set<number>();
          
          while (positions.size < maskCount) {
            positions.add(Math.floor(Math.random() * words.length));
          }
          
          const display = words.map((w, i) => positions.has(i) ? '…' : w).join(' ');
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: display,
            answer: verse.ar,
            metadata: { 
              translation: verse.en,
              verseRange: baseKey
            }
          };
          break;
        }

        case 'next-three': {
          // Show current verse, ask for next 3
          const keys = consecutive(baseKey, 4, maxKey);
          
          // If we don't have enough verses, try again
          if (keys.length < 4) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const verses = await Promise.all(keys.map(k => getVerseByKey(k)));
          const answerVerses = verses.slice(1); // Next 3 verses
          const { surah } = parseVerseKey(baseKey);
          const surahName = getSurahName(surah);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verse.ar,
            answer: answerVerses.map(v => v?.ar || '').join('\n\n'),
            metadata: {
              translation: verse.en,
              surahName,
              verseRange: `${surahName}, ${keys[1]} – ${keys[3]}`
            }
          };
          break;
        }

        case 'translation':
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verse.ar,
            answer: verse.en,
            metadata: {
              verseRange: baseKey
            }
          };
          break;

        case 'guess-surah': {
          // Show 3 consecutive verses
          const keys = consecutive(baseKey, 3, maxKey);
          
          // If we don't have enough verses, try again
          if (keys.length < 3) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const verses = await Promise.all(keys.map(k => getVerseByKey(k)));
          const { surah } = parseVerseKey(baseKey);
          const surahName = getSurahName(surah);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verses.map(v => v?.ar || '').join('\n\n'),
            answer: surahName,
            metadata: {
              surahName,
              verseRange: `${surahName}, ${keys[0]} – ${keys[keys.length - 1]}`
            }
          };
          break;
        }

        case 'help-imam': {
          // Load audio data
          const surahAudioResponse = await fetch('/data/surah.json');
          const surahAudioData = await surahAudioResponse.json();
          const segmentsResponse = await fetch('/data/segments.json');
          const segmentsData = await segmentsResponse.json();
          
          // Get up to 3 consecutive verses for audio (allowing cross-surah)
          const potentialKeys = consecutive(baseKey, 3, maxKey);
          
          if (potentialKeys.length < 1) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          // Get segments for available audio ayat (1-3)
          const audioSegments: Array<{ start: number; end: number; audioUrl: string }> = [];
          const audioKeys: VerseKey[] = [];
          
          for (const key of potentialKeys) {
            const { surah } = parseVerseKey(key);
            const audioUrl = surahAudioData[surah]?.audio_url;
            const segmentData = segmentsData[key];
            
            if (audioUrl && segmentData) {
              audioSegments.push({
                start: segmentData.timestamp_from,
                end: segmentData.timestamp_to,
                audioUrl
              });
              audioKeys.push(key);
            }
          }
          
          // Need at least 1 audio segment
          if (audioSegments.length < 1) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          // Determine the next surah after the last audio ayah
          const { surah: lastAudioSurah, ayah: lastAudioAyah } = parseVerseKey(audioKeys[audioKeys.length - 1]);
          const surahInfo = await import('@/lib/quran').then(m => m.getSurahInfo(lastAudioSurah));
          
          // If last audio ayah is the last ayah of its surah, answer is from next surah
          let answerKeys: VerseKey[];
          if (lastAudioAyah === surahInfo.ayahCount && lastAudioSurah < 114) {
            // Answer is first 2 ayahs of next surah
            answerKeys = [
              getVerseKey(lastAudioSurah + 1, 1),
              getVerseKey(lastAudioSurah + 1, 2)
            ];
          } else {
            // Answer is next 2 consecutive ayahs
            const nextKeys = consecutive(audioKeys[audioKeys.length - 1], 3, maxKey);
            answerKeys = nextKeys.slice(1, 3);
          }
          
          // Fetch answer verses
          const answerVerses = await Promise.all(answerKeys.map(k => getVerseByKey(k)));
          
          if (answerVerses.some(v => !v)) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const { surah: firstSurah } = parseVerseKey(audioKeys[0]);
          const { surah: lastAnswerSurah } = parseVerseKey(answerKeys[1]);
          const firstSurahName = getSurahName(firstSurah);
          const lastSurahName = getSurahName(lastAnswerSurah);
          
          const surahName = firstSurah === lastAnswerSurah ? firstSurahName : `${firstSurahName} – ${lastSurahName}`;
          
          // Build audio reference
          const audioReference = audioKeys.length === 1 
            ? audioKeys[0]
            : `${audioKeys[0]} – ${audioKeys[audioKeys.length - 1]}`;
          
          // Build answer reference
          const answerReference = `${answerKeys[0]} – ${answerKeys[1]}`;
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: "Listen to the ayat. What 2 ayat come next?",
            answer: answerVerses.map(v => v?.ar || '').join('\n\n'),
            metadata: {
              surahName,
              verseRange: answerReference,
              audioRange: audioReference,
              translation: answerVerses.map(v => v?.en || '').join('\n\n')
            },
            audio: {
              segments: audioSegments
            }
          };
          break;
        }

        case 'ayah-number': {
          // User guesses ayah number within surah
          const { surah, ayah } = parseVerseKey(baseKey);
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: verse.ar,
            answer: `Ayah ${ayah}`,
            metadata: {
              verseRange: `${getSurahName(surah)}, ${baseKey}`,
              translation: verse.en
            }
          };
          break;
        }

        case 'what-doesnt-belong': {
          // Show 4 ayat, 1 doesn't belong
          const { surah: correctSurah } = parseVerseKey(baseKey);
          
          // Get 2 more random verses from same surah
          const allSurahKeys = consecutive(getVerseKey(correctSurah, 1), 300, maxKey)
            .filter(k => {
              const { surah } = parseVerseKey(k);
              return surah === correctSurah;
            });
          
          const shuffledKeys = [...allSurahKeys].sort(() => Math.random() - 0.5);
          const additionalKeys = shuffledKeys
            .filter(k => k !== baseKey)
            .slice(0, 2);
          
          // Get 1 verse from different surah in same juz
          let mistakenKey: VerseKey | null = null;
          for (let attempt = 0; attempt < 50; attempt++) {
            const randomKey = await randomVerse(scopeParam);
            const { surah } = parseVerseKey(randomKey);
            if (surah !== correctSurah) {
              mistakenKey = randomKey;
              break;
            }
          }
          
          if (!mistakenKey) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          // Fetch all verses
          const correctVerses = await Promise.all([baseKey, ...additionalKeys].map(k => getVerseByKey(k)));
          const mistakenVerse = await getVerseByKey(mistakenKey);
          
          if (!mistakenVerse || correctVerses.some(v => !v)) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          // Randomize order
          const allVerses = [...correctVerses, mistakenVerse];
          const allKeys = [baseKey, ...additionalKeys, mistakenKey];
          const indices = allVerses.map((_, i) => i);
          const shuffledIndices = indices.sort(() => Math.random() - 0.5);
          
          const displayVerses = shuffledIndices.map(i => allVerses[i]);
          const displayKeys = shuffledIndices.map(i => allKeys[i]);
          
          const mistakenIndex = displayKeys.indexOf(mistakenKey);
          
          // Get correct ayahs info
          const correctKeys = [baseKey, ...additionalKeys];
          const correctAyahsInfo = correctKeys
            .map(k => {
              const { surah } = parseVerseKey(k);
              return `${getSurahName(surah)}, ${k}`;
            })
            .join(' | ');
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: displayVerses.map((v, i) => `${i + 1}. ${v?.ar || ''}`).join('\n\n'),
            answer: `Ayah ${mistakenIndex + 1} doesn't belong\n\n${mistakenVerse.ar}`,
            metadata: {
              verseRange: `Mistaken ayah: ${getSurahName(parseVerseKey(mistakenKey).surah)}, ${mistakenKey}`,
              translation: mistakenVerse.en,
              correctAyahsInfo
            }
          };
          break;
        }

        case 'what-is-x': {
          // Only works in surah scope
          if (scope.type !== 'surah') {
            return generateQuestion('beginning', scope, ayahRange);
          }
          
          const { surah, ayah } = parseVerseKey(baseKey);
          const surahName = getSurahName(surah);
          
          // Helper to convert number to ordinal
          const getOrdinal = (n: number): string => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
          };
          
          newQuestion = {
            mode,
            verseKey: baseKey,
            displayText: `What is the ${getOrdinal(ayah)} ayah of ${surahName}`,
            answer: verse.ar,
            metadata: {
              verseRange: `${surahName}, ${baseKey}`,
              translation: verse.en
            }
          };
          break;
        }

        case 'chaining-surah': {
          // Show last ayah of a surah, ask for first ayah of next surah
          const { surah } = parseVerseKey(baseKey);
          
          // Skip if we're on the last surah
          if (surah >= 114) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          // Import AYAH_COUNTS from quran.ts
          const currentSurahInfo = await import('@/lib/quran').then(m => m.getSurahInfo(surah));
          const lastAyahKey = getVerseKey(surah, currentSurahInfo.ayahCount);
          const firstNextKey = getVerseKey(surah + 1, 1);
          
          const lastAyahVerse = await getVerseByKey(lastAyahKey);
          const firstNextVerse = await getVerseByKey(firstNextKey);
          
          if (!lastAyahVerse || !firstNextVerse) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const currentSurahName = getSurahName(surah);
          const nextSurahName = getSurahName(surah + 1);
          
          newQuestion = {
            mode,
            verseKey: lastAyahKey,
            displayText: lastAyahVerse.ar,
            answer: firstNextVerse.ar,
            metadata: {
              translation: lastAyahVerse.en,
              verseRange: `Question: ${currentSurahName} ${lastAyahKey}, Answer: ${nextSurahName} ${firstNextKey}`
            }
          };
          break;
        }

        case 'chaining-surah-reverse': {
          // Show first ayah of a surah, ask for last ayah of previous surah
          const { surah } = parseVerseKey(baseKey);
          
          // Skip if we're on the first surah
          if (surah <= 1) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const firstAyahKey = getVerseKey(surah, 1);
          const prevSurahInfo = await import('@/lib/quran').then(m => m.getSurahInfo(surah - 1));
          const lastPrevKey = getVerseKey(surah - 1, prevSurahInfo.ayahCount);
          
          const firstAyahVerse = await getVerseByKey(firstAyahKey);
          const lastPrevVerse = await getVerseByKey(lastPrevKey);
          
          if (!firstAyahVerse || !lastPrevVerse) {
            return generateQuestion(mode, scope, ayahRange);
          }
          
          const currentSurahName = getSurahName(surah);
          const prevSurahName = getSurahName(surah - 1);
          
          newQuestion = {
            mode,
            verseKey: firstAyahKey,
            displayText: firstAyahVerse.ar,
            answer: lastPrevVerse.ar,
            metadata: {
              translation: firstAyahVerse.en,
              verseRange: `Question: ${currentSurahName} ${firstAyahKey}, Answer: ${prevSurahName} ${lastPrevKey}`
            }
          };
          break;
        }

        default:
          throw new Error('Unknown quiz mode');
      }

      setQuestion(newQuestion);
    } catch (error) {
      console.error('Failed to generate question:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const revealAnswer = useCallback(() => {
    setRevealed(true);
  }, []);

  const reset = useCallback(() => {
    setQuestion(null);
    setRevealed(false);
  }, []);

  return {
    question,
    revealed,
    loading,
    generateQuestion,
    revealAnswer,
    reset
  };
}
