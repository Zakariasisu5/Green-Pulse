import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Climate Coach. Ask me anything about sustainability, green business, circular economy, or eco-friendly tech!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await supabase.functions.invoke("climate-coach", {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error("Failed to get response. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How can I reduce plastic waste?",
    "What are easy eco-friendly swaps?",
    "Tell me about circular economy",
    "Best green tech for startups?",
  ];

  return (
    <div className="min-h-screen pb-20 flex flex-col bg-background">
      <div className="p-6 flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Climate Coach
          </h1>
          <p className="text-muted-foreground mt-1">Your AI guide to sustainable living</p>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col shadow-soft mb-4 border-border/50 overflow-hidden">
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-soft ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/80 backdrop-blur-sm"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Sparkles className="w-4 h-4 inline mr-2 text-accent animate-pulse-soft" />
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft">
                  <div className="flex gap-2 items-center">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse-soft" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Suggested Questions (only show when no messages) */}
        {messages.length === 1 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">Suggested questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left hover:bg-primary/10 transition-all"
                  onClick={() => {
                    setInput(question);
                  }}
                  disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about sustainability, green tech, circular economy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="h-14 text-base shadow-soft border-border/50 focus:ring-2 focus:ring-accent/50 transition-all"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-14 w-14 shadow-soft hover:shadow-glow transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Coach;