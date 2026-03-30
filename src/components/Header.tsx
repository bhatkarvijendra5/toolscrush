import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Linkedin, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import logoHorizontal from "/logo-horizontal.png";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const socialLinks = [
    { icon: Linkedin, href: "mailto:toolscrush10@gmail.com", label: "ToolsCrush on LinkedIn" },
    { icon: Facebook, href: "mailto:toolscrush10@gmail.com", label: "ToolsCrush on Facebook" },
    { icon: Instagram, href: "mailto:toolscrush10@gmail.com", label: "ToolsCrush on Instagram" },
    { icon: Twitter, href: "mailto:toolscrush10@gmail.com", label: "ToolsCrush on X (Twitter)" },
  ];

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/tools/merge-pdf", label: "Merge PDF" },
    { to: "/tools/pdf-to-word", label: "PDF to Word" },
    { to: "/tools/jpg-to-pdf", label: "JPG to PDF" },
    { to: "/tools/pdf-to-excel", label: "PDF to Excel" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2" aria-label="ToolsCrush - Home">
          <img src={logoHorizontal} alt="ToolsCrush" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Social + Auth */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-1 mr-2">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                <s.icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" aria-label="Open menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center space-x-3 border-t pt-4 mt-4">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="border-t pt-4 mt-4">
                {user ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { handleLogout(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
