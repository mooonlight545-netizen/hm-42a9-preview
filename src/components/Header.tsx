import { BookOpen, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * App Header Component
 * 
 * Displays the app title, donation button, theme toggle, settings, and account placeholders.
 * Consistent across all pages.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quran Memorizer
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 h-9"
          >
            <a
              href="https://donorbox.org/quran-memorizer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Support This Project</span>
            </a>
          </Button>

          <ThemeToggle />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile / login coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex h-9"
          >
            <Link to="/login">Log in / Create Account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
