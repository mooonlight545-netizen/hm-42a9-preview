import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  segments: Array<{ start: number; end: number; audioUrl?: string }>;
  onPlaybackComplete?: () => void;
  className?: string;
}

/**
 * Audio Player for playing specific segments of a surah
 * Used in "Help the Imam" mode
 * Supports cross-surah playback with different audio URLs per segment
 */
export function AudioPlayer({ 
  segments, 
  onPlaybackComplete,
  className 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const audioInstancesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);

  // Initialize audio instances for each unique URL
  useEffect(() => {
    const urlSet = new Set<string>();
    
    // Collect all unique URLs from segments
    segments.forEach(seg => {
      if (seg.audioUrl) urlSet.add(seg.audioUrl);
    });
    
    // Create audio instances
    const newInstances = new Map<string, HTMLAudioElement>();
    urlSet.forEach(url => {
      const audio = new Audio(url);
      newInstances.set(url, audio);
    });
    
    audioInstancesRef.current = newInstances;

    return () => {
      newInstances.forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [segments]);

  // Stop audio when segments change (new question)
  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlaying(false);
      setCurrentSegmentIndex(0);
      if (timeUpdateHandlerRef.current) {
        currentAudioRef.current.removeEventListener("timeupdate", timeUpdateHandlerRef.current);
      }
    }
  }, [segments]);

  const playSegments = async () => {
    setIsPlaying(true);
    setCurrentSegmentIndex(0);

    for (let i = 0; i < segments.length; i++) {
      setCurrentSegmentIndex(i);
      const segment = segments[i];
      const segmentUrl = segment.audioUrl;
      
      if (!segmentUrl) {
        console.error('No audio URL available for segment');
        continue;
      }
      
      const audio = audioInstancesRef.current.get(segmentUrl);
      if (!audio) {
        console.error('Audio instance not found for URL:', segmentUrl);
        continue;
      }
      
      currentAudioRef.current = audio;
      audio.currentTime = segment.start / 1000; // Convert ms to seconds
      
      await new Promise<void>((resolve) => {
        const checkTime = () => {
          if (audio.currentTime >= segment.end / 1000) {
            audio.removeEventListener("timeupdate", checkTime);
            audio.pause(); // Pause after each segment
            resolve();
          }
        };
        
        timeUpdateHandlerRef.current = checkTime;
        audio.addEventListener("timeupdate", checkTime);
        audio.play();
      });
      
      // Small pause between segments
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    onPlaybackComplete?.();
  };

  const pause = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlaying(false);
      
      if (timeUpdateHandlerRef.current) {
        currentAudioRef.current.removeEventListener("timeupdate", timeUpdateHandlerRef.current);
      }
    }
  };

  const replay = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      
      if (timeUpdateHandlerRef.current) {
        currentAudioRef.current.removeEventListener("timeupdate", timeUpdateHandlerRef.current);
      }
    }
    
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    
    setTimeout(() => playSegments(), 100);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!isPlaying ? (
        <Button
          onClick={playSegments}
          variant="default"
          size="lg"
          className="gap-2"
        >
          <Play className="h-5 w-5" />
          Play Audio
        </Button>
      ) : (
        <Button
          onClick={pause}
          variant="secondary"
          size="lg"
          className="gap-2"
        >
          <Pause className="h-5 w-5" />
          Pause
        </Button>
      )}
      
      <Button
        onClick={replay}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        <RotateCcw className="h-5 w-5" />
        Replay
      </Button>

      {isPlaying && (
        <span className="text-sm text-muted-foreground">
          Playing ayah {currentSegmentIndex + 1} of {segments.length}
        </span>
      )}
    </div>
  );
}
