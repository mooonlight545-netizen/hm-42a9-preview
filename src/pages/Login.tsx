import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Login Placeholder Page
 * 
 * Placeholder for future authentication features.
 */
export default function Login() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center space-y-6">
            <h1 className="text-2xl font-bold">Account Features Coming Soon</h1>
            <p className="text-muted-foreground">
              We're working on bringing you user accounts, progress tracking, and personalized features. 
              For now, enjoy testing your memorization without any login required!
            </p>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/test">
                <ArrowLeft className="h-4 w-4" />
                Back to Testing
              </Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
