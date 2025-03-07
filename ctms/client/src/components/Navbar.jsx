import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import IconButton from "./subcomponents/IconButton";
import NotificationPanel from "./NotificationPanel";
import {
  Bell,
  LayoutDashboard,
  Shield,
  Info,
  User,
  MessageSquare,
} from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/utils/AuthProvider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

function Navbar({
  showNavbar,
  devMode,
  notifications,
  setNotificationToAdd,
  setNotificationsNeedRefetch,
}) {
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const location = useLocation();

  const ListItem = React.forwardRef(
    ({ className, icon: Icon, title, children, ...props }, ref) => {
      return (
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
              location.pathname === props.to ? "bg-blue-600 text-white" : ""
            )}
            {...props}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon size={16} />}
              <div className="text-sm font-medium leading-none">{title}</div>
            </div>
            {children && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      );
    }
  );
  ListItem.displayName = "ListItem";

  return (
    <nav
      className={`${showNavbar ? "animate-fadein" : "animate-fadeout"} 
      fixed left-0 top-0 w-screen bg-slate-950 p-4 z-10 h-auto border-b border-slate-800`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl">
          <h1>
            <Link to="/" className="hover:text-blue-500 transition-colors">
              CTMS.
            </Link>
          </h1>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            {(user || devMode) && (
              <NavigationMenuItem>
                <ListItem to="/" icon={LayoutDashboard} title="Dashboard" />
              </NavigationMenuItem>
            )}

            {(user?.role === "admin" || devMode) && (
              <NavigationMenuItem>
                <ListItem to="/admin" icon={Shield} title="Admin" />
              </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <ListItem to="/about" icon={Info} title="About" />
            </NavigationMenuItem>

            <NavigationMenuItem>
              <ListItem
                to="/login"
                icon={User}
                title={user ? "Profile" : "Login"}
              />
            </NavigationMenuItem>

            {(user || devMode) && (
              <NavigationMenuItem>
                <ListItem to="/message" icon={MessageSquare} title="Message" />
              </NavigationMenuItem>
            )}

            {/* Notification Bell with Sheet */}
            {(user || devMode) && (
              <NavigationMenuItem>
                <Sheet
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                >
                  <SheetTrigger asChild>
                    <div className="relative">
                      <IconButton
                        icon={<Bell size={24} />}
                        color="hover:bg-blue-600 text-white"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
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
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default Navbar;
