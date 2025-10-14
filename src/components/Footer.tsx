import { Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * Footer Component
 * 
 * Displays social media links and navigation
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left side - Attribution */}
          <div className="text-sm text-muted-foreground">
            Built for the Ummah by{" "}
            <a
              href="https://www.hidayahproject.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline"
            >
              Hidayah Project
            </a>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <a
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
