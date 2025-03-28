import React, { useState, useEffect } from "react";
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
import { useNotification } from "@/utils/NotificationProvider";

function Navbar({ devMode }) {
  const {
    notifications,
    setNotificationsNeedRefetch,
    notificationsNeedRefetch,
  } = useNotification();
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const location = useLocation();
  const { toggleTheme } = useTheme();
  const isActive = (route) => location.pathname === route;

  // Define navigation links based on user role and dev mode
  const getLinks = () => {
    const links = [];

    if (user || devMode) {
      links.push({ label: "Dashboard", route: "/", icon: LayoutDashboard });
      if (user?.role === "admin" || devMode) {
        links.push({ label: "Admin", route: "/admin", icon: Shield });
      }
      links.push({
        label: "Chat",
        route: "/chat",
        icon: MessageSquare,
      });
    }

    links.push({ label: "About", route: "/about", icon: Info });
    links.push({
      label: user ? user.username : "Login",
      route: "/login",
      icon: User,
    });

    links.push({
      label: "Docs",
      route: "/docs",
      icon: MessageSquare,
    });

    return links;
  };

  function ThemeToggle() {
    return (
      <Button
        role="outline"
        className="p-2 outline rounded-xl flex"
        onClick={() => toggleTheme()}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const links = getLinks();

  const handleNavigation = (route) => {
    setMobileMenuOpen(false);
  };

  // Notification bell with count
  function NotificationBell({ unreadCount, ...props }, ref) {
    return (
      <Button ref={ref} variant="outline" className="relative" {...props}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    );
  }

  useEffect(() => {
    const intervalId = setInterval(
      () => setNotificationsNeedRefetch(true),
      3000
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NavigationMenu className="fixed top-0 left-0 p-4 flex justify-between min-w-full z-10 bg-background border">
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
                variant="outline"
                asChild
                className={cn(
                  "transition-colors",
                  isActive(link.route) &&
                    "not-dark:bg-primary not-dark:text-primary-foreground dark:bg-primary dark:text-primary-foreground",
                  !isActive(link.route) &&
                    "dark:hover:bg-primary dark:hover:text-primary-foreground hover:bg-primary hover:text-primary-foreground"
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
                  notificationsNeedRefetch={notificationsNeedRefetch}
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
                  notificationsNeedRefetch={notificationsNeedRefetch}
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
