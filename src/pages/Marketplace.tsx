import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingBag, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const Marketplace = () => {
  const [items, setItems] = useState<any[]>([]);
  const [greenPoints, setGreenPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadMarketplace();
    loadGreenPoints();
  }, []);

  const loadMarketplace = async () => {
    try {
      const { data } = await supabase
        .from("marketplace_items")
        .select("*")
        .order("cost", { ascending: true });

      setItems(data || []);
    } catch (error: any) {
      console.error("Error loading marketplace:", error);
    } finally {
      setLoading(false);
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

  const redeemItem = async (item: any) => {
    if (greenPoints < item.cost) {
      toast.error("Not enough GreenPoints!");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("greenpoints")
        .update({ total: greenPoints - item.cost })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(`Redeemed: ${item.name}! 🎉`);
      loadGreenPoints();

      // Open external link if available
      if (item.external_url) {
        window.open(item.external_url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const categories = ["all", "lifestyle", "personal-care", "tech", "donation", "fashion"];
  const filteredItems = filter === "all" ? items : items.filter((item) => item.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen pb-20">
        <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Redeem your GreenPoints</p>
          </div>
          <Badge variant="secondary" className="text-xl px-4 py-2">
            {greenPoints} 💚
          </Badge>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              className="capitalize whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const canAfford = greenPoints >= item.cost;

            return (
              <Card key={item.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="mt-2">{item.description}</CardDescription>
                    </div>
                    <Badge
                      variant={canAfford ? "default" : "secondary"}
                      className="ml-2 text-lg px-3 py-1"
                    >
                      {item.cost} 💚
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => redeemItem(item)}
                      disabled={!canAfford}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Redeem
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => item.external_url && window.open(item.external_url, "_blank")}
                          disabled={!item.external_url}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.external_url ? "Learn more about this item" : "More info coming soon"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

        <Navigation />
      </div>
    </TooltipProvider>
  );
};

export default Marketplace;