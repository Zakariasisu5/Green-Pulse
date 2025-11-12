import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const Challenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true);

      const { data: userChallengesData } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id);

      setChallenges(challengesData || []);
      setUserChallenges(userChallengesData || []);
    } catch (error: any) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_challenges")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
        });

      if (error) throw error;

      toast.success("Challenge joined! Good luck! 💪");
      loadChallenges();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isJoined = (challengeId: string) => {
    return userChallenges.some((uc) => uc.challenge_id === challengeId);
  };

  const getChallengeProgress = (challengeId: string) => {
    const userChallenge = userChallenges.find((uc) => uc.challenge_id === challengeId);
    return userChallenge?.progress || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Challenges
          </h1>
          <p className="text-muted-foreground mt-1">Push yourself with weekly eco goals</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="gradient-card shadow-soft border-none">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{userChallenges.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{challenges.length}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Challenges */}
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-semibold mb-2">No challenges available</p>
                <p className="text-sm text-muted-foreground">Check back soon for new eco challenges!</p>
              </CardContent>
            </Card>
          ) : (
            challenges.map((challenge) => {
              const joined = isJoined(challenge.id);
              const progress = getChallengeProgress(challenge.id);
              const isComplete = progress >= 100;

              return (
                <Card key={challenge.id} className={`shadow-soft border-border/50 transition-all ${joined ? 'shadow-glow' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className={`w-5 h-5 ${joined ? 'text-accent' : 'text-primary'}`} />
                          {challenge.title}
                        </CardTitle>
                        <CardDescription className="mt-2 leading-relaxed">
                          {challenge.description}
                        </CardDescription>
                      </div>
                      {joined && (
                        <Badge variant={isComplete ? "default" : "secondary"} className="ml-2">
                          {isComplete ? (
                            <>
                              <Trophy className="w-3 h-3 mr-1" />
                              Complete!
                            </>
                          ) : (
                            <>
                              <Trophy className="w-3 h-3 mr-1" />
                              Joined
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{challenge.duration} days challenge</span>
                      </div>
                      {joined && !isComplete && (
                        <Badge variant="outline" className="text-xs">
                          Day {Math.floor((progress / 100) * challenge.duration)} of {challenge.duration}
                        </Badge>
                      )}
                    </div>

                    {joined ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-muted-foreground">Progress</span>
                          <span className={isComplete ? 'text-accent' : 'text-primary'}>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        {isComplete ? (
                          <p className="text-sm text-center text-accent font-medium">
                            🎉 Challenge completed! You're amazing!
                          </p>
                        ) : (
                          <p className="text-xs text-center text-muted-foreground">
                            Keep logging eco actions to boost your progress
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => joinChallenge(challenge.id)}
                        className="w-full shadow-soft hover:shadow-glow transition-all"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Join Challenge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Challenges;