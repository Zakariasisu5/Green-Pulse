import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Flame, Heart, LogOut } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import LogActionDialog from "@/components/LogActionDialog";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [ecoTip, setEcoTip] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [greenPoints, setGreenPoints] = useState(0);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error logging out");
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Run all queries in parallel for faster loading
      const [profileRes, actionsRes, pointsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("eco_actions").select("timestamp").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(30),
        supabase.from("greenpoints").select("total").eq("user_id", user.id).single(),
      ]);

      // Set profile
      if (profileRes.data) {
        setProfile(profileRes.data);
        // Generate content in background (non-blocking)
        generateDailyContent(profileRes.data);
      }

      // Calculate streak
      let currentStreak = 0;
      let lastDate = new Date();
      
      for (const action of actionsRes.data || []) {
        const actionDate = new Date(action.timestamp);
        const diffDays = Math.floor((lastDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak++;
          lastDate = actionDate;
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // Set green points
      setGreenPoints(pointsRes.data?.total || 0);
    } catch (error: any) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("eco_actions")
        .select("timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(30);

      // Calculate streak
      let currentStreak = 0;
      let lastDate = new Date();
      
      for (const action of data || []) {
        const actionDate = new Date(action.timestamp);
        const diffDays = Math.floor((lastDate.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          currentStreak++;
          lastDate = actionDate;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error: any) {
      console.error("Error loading streak:", error);
    }
  };

  const loadGreenPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("greenpoints")
        .select("total")
        .eq("user_id", user.id)
        .single();

      setGreenPoints(data?.total || 0);
    } catch (error: any) {
      console.error("Error loading green points:", error);
    }
  };

  const generateDailyContent = async (profileData: any) => {
    try {
      // Check cache first
      const cacheKey = `eco-tip-${profileData.id}`;
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}-time`);
      
      // Use cache if less than 24 hours old
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 24 * 60 * 60 * 1000) {
          const cachedData = JSON.parse(cached);
          setEcoTip(cachedData.tip);
          if (profileData?.spiritual_mode) {
            setAffirmation(cachedData.affirmation);
          }
          return;
        }
      }

      const response = await supabase.functions.invoke("generate-eco-content", {
        body: {
          type: "daily",
          profile: profileData,
        },
      });

      if (response.data) {
        setEcoTip(response.data.tip);
        if (profileData?.spiritual_mode) {
          setAffirmation(response.data.affirmation);
        }
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome, {profile?.name || "Friend"}!
            </h1>
            <p className="text-muted-foreground mt-1">Let's make today count 🌱</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2 shadow-soft">
                {greenPoints} 💚
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">GreenPoints</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Streak Card */}
        <Card className="gradient-card shadow-glow border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse-soft">
                  <Flame className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{streak} days</p>
                  <p className="text-sm text-muted-foreground">Green streak 🔥</p>
                  {streak > 0 && (
                    <p className="text-xs text-accent mt-1">
                      Keep it going! You're amazing!
                    </p>
                  )}
                  {streak === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Log your first action to start
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affirmation (if spiritual mode) */}
        {profile?.spiritual_mode && affirmation && (
          <Card className="gradient-accent shadow-glow border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-accent animate-pulse-soft" />
                Today's Affirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-lg italic leading-relaxed">{affirmation}</p>
            </CardContent>
          </Card>
        )}

        {/* Eco Tip */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Today's Eco Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ecoTip ? (
              <p className="text-base leading-relaxed">{ecoTip}</p>
            ) : (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action */}
        <Button
          onClick={() => setShowLogDialog(true)}
          size="lg"
          className="w-full h-16 text-lg shadow-glow hover:shadow-xl transition-all"
        >
          <Plus className="w-6 h-6 mr-2" />
          Log a Green Win Today
        </Button>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-soft">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">{greenPoints}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-accent">{streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">{profile?.goals?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
      <LogActionDialog
        open={showLogDialog}
        onClose={() => setShowLogDialog(false)}
        onSuccess={() => {
          loadStreak();
          loadGreenPoints();
          toast.success("Green win logged! +10 points 🌟");
        }}
      />
    </div>
  );
};

export default Home;