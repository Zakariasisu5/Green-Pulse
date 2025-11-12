import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookHeart, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";

const Journal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [todayEntry, setTodayEntry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadEntries();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    } catch (error: any) {
      console.error("Error loading profile:", error);
    }
  };

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      setEntries(data || []);

      // Check if there's an entry for today
      const today = format(new Date(), "yyyy-MM-dd");
      const existingEntry = data?.find((e) => e.date === today);
      if (existingEntry) {
        setTodayEntry(existingEntry.entry);
      }
    } catch (error: any) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!todayEntry.trim()) {
      toast.error("Please write something first");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = format(new Date(), "yyyy-MM-dd");

      // Check if entry exists for today
      const { data: existing } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("journal_entries")
          .update({ entry: todayEntry })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry: todayEntry,
            date: today,
          });

        if (error) throw error;
      }

      toast.success("Entry saved 💚");
      loadEntries();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const dailyPrompt = profile?.spiritual_mode
    ? "How did you honor the Earth and yourself today?"
    : "What green actions did you take today?";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Eco Journal
          </h1>
          <p className="text-muted-foreground mt-1">Reflect on your green journey</p>
        </div>

        {/* Journal Stats */}
        <Card className="shadow-soft border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{entries.length}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {entries.filter(e => e.date >= format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")).length}
                </p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {todayEntry ? "✓" : "○"}
                </p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Entry */}
        <Card className="gradient-card shadow-glow border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookHeart className="w-5 h-5 text-accent animate-pulse-soft" />
              Today's Reflection
            </CardTitle>
            <p className="text-sm text-muted-foreground italic leading-relaxed mt-2">
              {dailyPrompt}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Pour your heart out... What green actions brought you joy today? How did they make you feel?"
              value={todayEntry}
              onChange={(e) => setTodayEntry(e.target.value)}
              rows={8}
              className="resize-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{todayEntry.length} characters</span>
              <span>{todayEntry.trim() ? "✓ Ready to save" : "Start writing..."}</span>
            </div>
            <Button
              onClick={saveEntry}
              className="w-full shadow-soft hover:shadow-glow transition-all"
              disabled={saving || !todayEntry.trim()}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <BookHeart className="w-4 h-4 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Past Entries */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Past Reflections
          </h2>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <BookHeart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-semibold mb-2">No entries yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start journaling today and build your green story! 🌱
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="shadow-soft border-border/50 hover:shadow-glow transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.date), "EEEE, MMM dd, yyyy")}
                      </Badge>
                      {entry.date === format(new Date(), "yyyy-MM-dd") && (
                        <Badge variant="secondary" className="text-xs">Today</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {entry.entry}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Journal;