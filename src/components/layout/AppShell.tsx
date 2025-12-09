import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { useNavigation } from "@/contexts/NavigationContext";
import { Dashboard } from "@/components/pages/Dashboard";
import { PathwayExplorer } from "@/components/pages/PathwayExplorer";
import { ReactionExplorer } from "@/components/pages/ReactionExplorer";
import { CompoundExplorer } from "@/components/pages/CompoundExplorer";
import { Analytics } from "@/components/pages/Analytics";
import { About } from "@/components/pages/About";

export function AppShell() {
  const { currentPage } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "pathway":
        return <PathwayExplorer />;
      case "reaction":
        return <ReactionExplorer />;
      case "compound":
        return <CompoundExplorer />;
      case "analytics":
        return <Analytics />;
      case "about":
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}
