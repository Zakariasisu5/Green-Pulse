import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  streak: number;
  challenges_count: number;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Get top 5 users by greenpoints
      const { data: greenPointsData } = await supabase
        .from("greenpoints")
        .select("user_id, total")
        .order("total", { ascending: false })
        .limit(5);

      if (!greenPointsData || greenPointsData.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      // Get profile data for these users
      const userIds = greenPointsData.map((gp) => gp.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, streak")
        .in("id", userIds);

      // Get challenges count for each user
      const { data: challengesData } = await supabase
        .from("user_challenges")
        .select("user_id")
        .in("user_id", userIds);

      // Combine the data
      const leaderboardData: LeaderboardUser[] = greenPointsData.map((gp) => {
        const profile = profilesData?.find((p) => p.id === gp.user_id);
        const challengesCount = challengesData?.filter(
          (c) => c.user_id === gp.user_id
        ).length || 0;

        return {
          id: gp.user_id,
          name: profile?.name || "Green Friend",
          avatar_url: profile?.avatar_url || null,
          points: gp.total,
          streak: profile?.streak || 0,
          challenges_count: challengesCount,
        };
      });

      setLeaders(leaderboardData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Top Eco Champions 🌱
          </CardTitle>
          <CardDescription>See who's leading the green movement this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No champions yet — be the first to log a win!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Top Eco Champions 🌱
        </CardTitle>
        <CardDescription>See who's leading the green movement this week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaders.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-smooth"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
            </div>

            {/* Avatar */}
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {user.streak} days
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {user.challenges_count}
                </span>
              </div>
            </div>

            {/* Points Badge */}
            <Badge variant="secondary" className="text-base px-3 py-1">
              {user.points} 💚
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
