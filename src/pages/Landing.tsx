import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookOpen, Brain, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/**
 * Landing Page
 * 
 * Welcome page with app description and call-to-action.
 * Features overview of the 8 quiz modes.
 */
export default function Landing() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setVisibleCards(prev => new Set(prev).add(index));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Free Hifz Testing Tool
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Master Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quran Memorization
            </span>
          </h1>

          {/* Featured Ayah */}
          <div className="max-w-3xl mx-auto space-y-3 py-6">
            <div 
              dir="rtl" 
              className="arabic-text text-3xl md:text-4xl text-primary font-semibold leading-relaxed"
            >
              وَلَقَدْ يَسَّرْنَا ٱلْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍۢ
            </div>
            <p className="text-lg text-muted-foreground italic">
              "And We have certainly made the Qur'an easy for remembrance — so is there anyone who will remember?"
            </p>
            <p className="text-sm text-muted-foreground">— Surah Al-Qamar (54:40)</p>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test and reinforce your Hifz with 16 interactive quiz modes. 
            Practice by Juz, Surah, or the entire Quran.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild className="gap-2">
              <Link to="/test">
                <Brain className="h-5 w-5" />
                Start Testing
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="glass-card p-6 space-y-3 border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">16 Quiz Modes</h3>
            <p className="text-sm text-muted-foreground">
              Various robust methods of truly testing your Quran memorization.
            </p>
          </Card>

          <Card className="glass-card p-6 space-y-3 border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold">Flexible Scope</h3>
            <p className="text-sm text-muted-foreground">
              Practice the full Quran, specific Juz (1-30), or individual Surahs.
            </p>
          </Card>

          <Card className="glass-card p-6 space-y-3 border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-success/10 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold">Session Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Track your correct answers and accuracy percentage during each session.
            </p>
          </Card>

          <Card className="glass-card p-6 space-y-3 border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold">No Sign-up Required</h3>
            <p className="text-sm text-muted-foreground">
              No account needed — start testing immediately for free.
            </p>
          </Card>
        </div>

        {/* Quiz Modes Detail */}
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8">Quiz Modes</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Beginning Completion", desc: "Complete the first portion of an ayah" },
              { title: "Ending Completion", desc: "Complete the last portion of an ayah" },
              { title: "Missing Ayah", desc: "Identify the missing ayah in a sequence" },
              { title: "Order Rearrange", desc: "Arrange shuffled ayat in correct order" },
              { title: "Next Ayah", desc: "Recall the next ayah from memory" },
              { title: "Previous Ayah", desc: "Recall the previous ayah from memory" },
              { title: "Partial Reveal", desc: "Complete concealed parts of an ayah" },
              { title: "Next 3 Ayat", desc: "Recall the next three ayat" },
              { title: "Translation", desc: "Match Arabic ayat with English translation" },
              { title: "Guess Surah", desc: "Identify which Surah contains the ayat" },
              { title: "Help the Imam", desc: "Listen to up to 3 ayat and recall the next 2" },
              { title: "Chaining Surah", desc: "Given the last ayah of a surah, recall the first ayah of the next surah" },
              { title: "Chaining Surah Reverse", desc: "Given the first ayah of a surah, recall the last ayah of the previous surah" },
              { title: "Ayah Number Guess", desc: "Given an ayah, identify its number within the surah" },
              { title: "What Doesn't Belong", desc: "Four ayat shown - spot the one that doesn't belong to the surah" },
              { title: "What is X Ayah?", desc: "Asked for a specific ayah number - recall the text (Surah scope only)" }
            ].map((mode, i) => (
              <Card 
                key={i} 
                ref={(el) => (cardRefs.current[i] = el)}
                className={`glass-card p-4 flex gap-4 items-start opacity-0 ${
                  visibleCards.has(i) 
                    ? i % 2 === 0 
                      ? 'animate-slide-in-left' 
                      : 'animate-slide-in-right'
                    : ''
                }`}
                style={{ animationDelay: `${(i % 4) * 100}ms` }}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{mode.title}</h4>
                  <p className="text-sm text-muted-foreground">{mode.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center mt-16 pt-12 border-t">
          <h3 className="text-2xl font-bold mb-4">Ready to strengthen your Hifz?</h3>
          <Button size="lg" asChild className="gap-2">
            <Link to="/test">
              <Brain className="h-5 w-5" />
              Start Testing Now
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
