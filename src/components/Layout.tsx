import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export const Layout = ({ children, user }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate("/auth");
    }
  };

  const navItems = [
    { path: "/auth", label: "Sign In / Sign Up", icon: UserCircle },
    { path: "/add-expense", label: "Add Expense", icon: PlusCircle },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Navigation */}
      <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Expense Tracker</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-sm text-muted-foreground px-3">
              {user.email}
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
