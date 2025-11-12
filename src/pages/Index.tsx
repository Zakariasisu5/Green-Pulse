import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Target, Trophy, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      navigate("/home");
    } else {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center animate-pulse">
            <Leaf className="w-12 h-12 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2">GreenPulse</h1>
          <p className="text-muted-foreground">Loading your eco journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-accent flex items-center justify-center animate-scale-in shadow-glow">
            <Leaf className="w-16 h-16 text-accent-foreground" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold animate-fade-in">
            GreenPulse
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Transform your lifestyle into a force for good. Track, compete, and earn rewards for every eco-friendly action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How GreenPulse Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-soft hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Track Your Impact</CardTitle>
                <CardDescription>
                  Log eco-friendly actions and watch your positive impact grow. From recycling to using public transport, every action counts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Join Challenges</CardTitle>
                <CardDescription>
                  Participate in community challenges, compete with friends, and climb the leaderboard while making a difference.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover-scale">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Earn Rewards</CardTitle>
                <CardDescription>
                  Collect GreenPoints and redeem them for eco-friendly products, donations to environmental causes, and more.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-6 gradient-hero">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Users className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Join Our Growing Community</h2>
          <p className="text-xl text-muted-foreground">
            Thousands of eco-warriors are already making a difference. Share your journey, get inspired, and inspire others.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-background border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 GreenPulse. Making the world greener, one action at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;