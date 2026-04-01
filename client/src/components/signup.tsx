import { signUp } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Signup({ setIsSignup }: { setIsSignup: (value: boolean) => void }) {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp({
        email,
        password,
        phone,
        name,
        vehicleNumber,
        vehicleType
      });

      setLoading(false);
      toast.success("Account created successfully", {
        description: "You can now log in with your credentials."
      });
      setIsSignup(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to create account");
      toast.error("Signup failed", {
        description: err.message || "Please try again"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-orange-50 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 animate-fade-in">
        <CardHeader className="text-center pb-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSignup(false)}
            className="absolute left-4 top-4 hover:bg-primary/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="mx-auto mb-6">
            <img src="/errand-magics-logo.png" alt="Errand Magics Logo" className="h-40 w-auto mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Join Errand Magics
          </CardTitle>
          <CardDescription className="text-base mt-2">Create your delivery partner account</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="animate-slide-up border-destructive/50 bg-destructive/5">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-11 px-4 transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-name"
              />
            </div>

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
                className="h-11 px-4 transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10 digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
                pattern="[0-9]{10}"
                className="h-11 px-4 transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-phone"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType" className="text-sm font-medium">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType} disabled={loading} required>
                  <SelectTrigger className="h-11 transition-all focus:ring-2 focus:ring-primary/20" data-testid="select-vehicle-type">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bike">Bike</SelectItem>
                    <SelectItem value="Bicycle">Bicycle</SelectItem>
                    <SelectItem value="Scooter">Scooter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" className="text-sm font-medium">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  placeholder="AB12CD3456"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  required
                  disabled={loading}
                  className="h-11 px-4 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-vehicle-number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="h-11 px-4 transition-all focus:ring-2 focus:ring-primary/20"
                data-testid="input-password"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mt-6"
              disabled={loading || !name || !email || !phone || !vehicleType || !vehicleNumber || !password}
              data-testid="button-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
