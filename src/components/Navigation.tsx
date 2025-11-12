import { NavLink } from "react-router-dom";
import { Home, Target, BookHeart, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/challenges", icon: Target, label: "Challenges" },
    { to: "/journal", icon: BookHeart, label: "Journal" },
    { to: "/marketplace", icon: ShoppingBag, label: "Shop" },
    { to: "/community", icon: Users, label: "Community" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-smooth",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;