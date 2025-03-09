import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Shield,
  Info,
  User,
  MessageSquare,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/utils/AuthProvider";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import NotificationPanel from "./NotificationPanel";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeProvider";

function Navbar({ devMode, notifications, setNotificationsNeedRefetch }) {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  function ThemeToggle() {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "relative w-9 h-9 rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200"
        )}
        onClick={() => toggleTheme()}
      >
        <Sun
          className={cn(
            "h-4 w-4 absolute",
            "t200e",
            "rotate-0 scale-100",
            "dark:-rotate-90 dark:scale-0"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 absolute",
            "t200e",
            "rotate-90 scale-0",
            "dark:rotate-0 dark:scale-100"
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isActive = (route) => location.pathname === route;

  // Define navigation links based on user role and dev mode
  const getLinks = () => {
    const links = [];

    if (user || devMode) {
      links.push({ label: "Dashboard", route: "/", icon: LayoutDashboard });
      if (user?.role === "admin" || devMode) {
        links.push({ label: "Admin", route: "/admin", icon: Shield });
      }
      links.push({ label: "Message", route: "/message", icon: MessageSquare });
    }

    links.push({ label: "About", route: "/about", icon: Info });
    links.push({
      label: user ? user.username : "Login",
      route: "/login",
      icon: User,
    });

    return links;
  };

  const links = getLinks();

  const handleNavigation = (route) => {
    setMobileMenuOpen(false);
  };

  // Notification bell with count
  function NotificationBell({ unreadCount, ...props }, ref) {
    return (
      <Button ref={ref} variant="secondary" className="relative p-2" {...props}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <NavigationMenu className="fixed top-0 left-0 p-4 flex justify-between min-w-full animate-fade-in z-10">
      <NavigationMenuList className={"px-10"}>
        {/* CTMS Logo inside NavigationMenu */}
        <NavigationMenuItem>
          <Button variant="link" className="font-bold text-4xl" asChild>
            <Link to="/">CTMS.</Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="px-10 flex items-center justify-center">
        {/* Desktop Navigation - Main Links */}

        <NavigationMenuList className="hidden lg:flex gap-4">
          {links.map((link) => (
            <NavigationMenuItem key={link.route}>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "transition-colors",
                  isActive(link.route) &&
                    "bg-secondary text-secondary-foreground font-medium",
                  !isActive(link.route) && "text-primary-foreground bg-primary"
                )}
                onClick={() => handleNavigation(link.route)}
              >
                <Link to={link.route} className="flex items-center">
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              </Button>
            </NavigationMenuItem>
          ))}

          <Separator
            orientation="vertical"
            className={"hidden lg:flex border"}
          />

          {(user || devMode) && (
            <NavigationMenuItem>
              <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
                <SheetTrigger asChild>
                  <NotificationBell
                    unreadCount={unreadCount}
                    onClick={() => setNotificationOpen(true)}
                  />
                </SheetTrigger>
                <NotificationPanel
                  notifications={notifications}
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                  setNotificationsNeedRefetch={setNotificationsNeedRefetch}
                />
              </Sheet>
            </NavigationMenuItem>
          )}

          <Separator orientation="vertical" className={"border"} />

          <NavigationMenuItem className="hidden lg:flex">
            <ThemeToggle />
          </NavigationMenuItem>
        </NavigationMenuList>

        {/* Mobile Navigation Controls */}
        <NavigationMenuList className="lg:hidden">
          {(user || devMode) && (
            <NavigationMenuItem>
              <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
                <SheetTrigger asChild>
                  <NotificationBell
                    unreadCount={unreadCount}
                    onClick={() => setNotificationOpen(true)}
                  />
                </SheetTrigger>
                <NotificationPanel
                  notifications={notifications}
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                  setNotificationsNeedRefetch={setNotificationsNeedRefetch}
                />
              </Sheet>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="default" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>
                    <div className="text-xl font-bold">CTMS</div>
                  </SheetTitle>
                  <SheetDescription>Navigation menu</SheetDescription>
                </SheetHeader>

                <nav className="flex flex-col items-center gap-4">
                  {links.map((link) => (
                    <Button
                      key={link.route}
                      variant="default"
                      asChild
                      className={`w-3/4`}
                      onClick={() => handleNavigation(link.route)}
                    >
                      <Link to={link.route} className="flex items-center gap-2">
                        {link.icon && <link.icon className="h-4 w-4" />}
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </nav>

                {/* Toggle dark/light mode */}
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}

export default Navbar;
