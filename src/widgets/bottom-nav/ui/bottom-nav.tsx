import { useLocation, useNavigate } from "react-router";

import { Heart, MapPin, MessageCircle, User, Users } from "lucide-react";

import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { icon: MessageCircle, label: "Чат", route: ROUTES.chat },
  { icon: MapPin, label: "Рядом", route: ROUTES.nearby },
  { icon: Users, label: "Люди", route: ROUTES.feed },
  { icon: Heart, label: "Лайки", route: ROUTES.likes },
  { icon: User, label: "Профиль", route: ROUTES.profile },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="grid grid-cols-5 px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ icon: Icon, label, route }) => {
        const active = route === pathname;
        return (
          <button
            key={label}
            type="button"
            onClick={route ? () => navigate(route) : undefined}
            className={cn(
              "flex flex-col items-center gap-1 text-xs",
              active ? "text-primary" : "text-[#6B7280]",
            )}
          >
            <Icon className={cn("size-6", active && "fill-current")} />
            {label}
          </button>
        );
      })}
    </nav>
  );
};
