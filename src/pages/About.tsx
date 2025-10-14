import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

/**
 * About Page
 * 
 * Information about the QuranRevise project
 */
export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">About Quran Memorizer</h1>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                This project was made to help those on the path of memorizing the entire Quran 
                to not only retain what they learn, but to master it.
              </p>
              
              <p>
                The idea is to provide testing modes that really train your mind and push you to 
                the limit so you know every ayah of the Quran to heart.
              </p>
              
              <div className="pt-4 border-t">
                <p className="text-sm mb-3">Made possible by the developer tools at:</p>
                <a
                  href="https://qul.tarteel.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  Quranic Universal Library
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              <div className="pt-4 border-t">
                <p className="font-semibold text-foreground">
                  Consider supporting this project to further develop it and bring on new features.
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/test">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Testing
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
