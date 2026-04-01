import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Truck } from "lucide-react";
import Signup from "@/components/signup";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const { login, error, loading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  if (isSignup) {
    return <Signup setIsSignup={setIsSignup} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-orange-50 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 animate-fade-in">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6">
            <img src="/errand-magics-logo.png" alt="ErrandMagics Logo" className="h-28 w-auto mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            ErrandMagics
          </CardTitle>
          <CardDescription className="text-base mt-2">Delivery Partner Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-slide-up border-destructive/50 bg-destructive/5">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 px-4 text-base transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 px-4 text-base transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              disabled={loading || !email || !password}
              data-testid="button-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            type="button"
            onClick={() => setIsSignup(true)}
            className="w-full h-12 text-base hover:bg-primary/5 hover:text-primary hover:border-primary transition-all"
            data-testid="button-signup"
          >
            Create New Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
