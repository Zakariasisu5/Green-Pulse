import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LogActionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const actionTypes = [
  { value: "no-plastic", label: "Avoided plastic" },
  { value: "plant-based", label: "Ate plant-based meal" },
  { value: "recycled", label: "Recycled or composted" },
  { value: "walked", label: "Walked/biked instead of driving" },
  { value: "saved-energy", label: "Saved energy/water" },
  { value: "other", label: "Other green action" },
];

const emojiRatings = [
  { value: "😊", label: "😊 Great" },
  { value: "🙂", label: "🙂 Good" },
  { value: "😐", label: "😐 Okay" },
  { value: "😕", label: "😕 Challenging" },
];

const LogActionDialog = ({ open, onClose, onSuccess }: LogActionDialogProps) => {
  const [type, setType] = useState("");
  const [emojiRating, setEmojiRating] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!type || !emojiRating) {
      toast.error("Please select an action type and rating");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate impact score
      const impactScore = emojiRating === "😊" ? 15 : emojiRating === "🙂" ? 10 : emojiRating === "😐" ? 5 : 3;

      // Insert action
      const { error: actionError } = await supabase
        .from("eco_actions")
        .insert({
          user_id: user.id,
          type,
          note: note || null,
          emoji_rating: emojiRating,
          impact_score: impactScore,
        });

      if (actionError) throw actionError;

      // Update greenpoints
      const { data: currentPoints } = await supabase
        .from("greenpoints")
        .select("total")
        .eq("user_id", user.id)
        .single();

      const { error: pointsError } = await supabase
        .from("greenpoints")
        .update({ total: (currentPoints?.total || 0) + impactScore })
        .eq("user_id", user.id);

      if (pointsError) throw pointsError;

      toast.success(`Great work! +${impactScore} GreenPoints 💚`);
      onSuccess();
      onClose();
      setType("");
      setEmojiRating("");
      setNote("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Green Win 🌱</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>What did you do?</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>How did it feel?</Label>
            <Select value={emojiRating} onValueChange={setEmojiRating}>
              <SelectTrigger>
                <SelectValue placeholder="Rate your experience" />
              </SelectTrigger>
              <SelectContent>
                {emojiRatings.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value}>
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add a note (optional)</Label>
            <Textarea
              placeholder="Share your thoughts..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Log Action"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogActionDialog;