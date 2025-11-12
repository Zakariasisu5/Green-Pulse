import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Leaf, Heart, Recycle, Sprout, MapPin } from "lucide-react";

const ecoGoals = [
  { id: "plastic", label: "Reduce plastic", icon: Recycle },
  { id: "plant-based", label: "Eat plant-based", icon: Sprout },
  { id: "zero-waste", label: "Zero waste living", icon: Leaf },
  { id: "sustainable-transport", label: "Green transport", icon: Heart },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [spiritualMode, setSpiritualMode] = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          goals,
          spiritual_mode: spiritualMode,
          location: location || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Welcome to GreenPulse! 🌱");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-2xl shadow-glow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <Leaf className="w-10 h-10 text-accent-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Let's Get Started</CardTitle>
          <CardDescription className="text-lg">
            Step {step} of 3 - Customize your journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Select your eco goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ecoGoals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                        goals.includes(goal.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox checked={goals.includes(goal.id)} />
                        <Icon className="w-6 h-6 text-primary" />
                        <Label className="cursor-pointer text-lg">{goal.label}</Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-lg gradient-card">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Heart className="w-6 h-6 text-accent" />
                    Spiritual Mode
                  </h3>
                  <p className="text-muted-foreground">
                    Add daily affirmations and mindful journaling
                  </p>
                </div>
                <Switch
                  checked={spiritualMode}
                  onCheckedChange={setSpiritualMode}
                  className="scale-125"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Where are you? (Optional)
              </h3>
              <Input
                type="text"
                placeholder="e.g., Accra, Ghana"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 text-lg"
              />
              <p className="text-sm text-muted-foreground">
                This helps us provide localized eco tips and resources
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1 h-12"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 h-12"
                disabled={step === 1 && goals.length === 0}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="flex-1 h-12"
                disabled={loading}
              >
                {loading ? "Setting up..." : "Start My Green Journey"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;