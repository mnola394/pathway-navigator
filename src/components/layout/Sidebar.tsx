import {
  LayoutDashboard,
  Route,
  FlaskConical,
  Atom,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation, Page } from "@/contexts/NavigationContext";

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pathway", label: "Pathway Explorer", icon: Route },
  { id: "reaction", label: "Reaction Explorer", icon: FlaskConical },
  { id: "compound", label: "Compound Explorer", icon: Atom },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "about", label: "About / Help", icon: HelpCircle },
];

export function Sidebar() {
  const { currentPage, setCurrentPage } = useNavigation();

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-muted">
          <p>Mock Data Mode</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
