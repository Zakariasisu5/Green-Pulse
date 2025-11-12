import { MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingCoachButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide button when on coach page
  if (location.pathname === "/coach") {
    return null;
  }

  return (
    <Button
      onClick={() => navigate("/coach")}
      className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default FloatingCoachButton;
