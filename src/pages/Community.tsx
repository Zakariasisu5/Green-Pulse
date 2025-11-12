import Navigation from "@/components/Navigation";
import Leaderboard from "@/components/Leaderboard";
import { Users } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground">Join the green movement</p>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      <Navigation />
    </div>
  );
};

export default Community;
