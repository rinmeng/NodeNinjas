import React, { useState, useEffect } from "react";
import { useAuth } from "@/utils/AuthProvider";
import {
  User,
  Lock,
  LogIn,
  ChartSpline,
  TrendingUp,
  Mail,
  Contact,
  Shield,
  CircleUserRound,
  UserCog,
} from "lucide-react";
import TickCheckbox from "../components/subcomponents/TickCheckbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import proxy from "@/src/utils/proxy";

// Define your validation schemas with Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  isRemembered: z.boolean().default(true),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["team_member", "admin"]),
    manager_username: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is team_member, manager_username is required
      if (data.role === "team_member" && !data.manager_username) {
        return false;
      }
      return true;
    },
    {
      message: "Manager username is required for team members",
      path: ["manager_username"],
    }
  );

const Login = ({ setShowNavbar, setFeedbackMessage }) => {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Replace your login submit handler with:
  const onLoginSubmit = async (data) => {
    const result = await login(data.username, data.password, data.isRemembered);

    if (result.success) {
      setFeedbackMessage({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
    } else {
      setFeedbackMessage({
        title: "Login Failed",
        description: result.error,
      });
    }
  };

  // Initialize react-hook-form with Zod validation
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      isRemembered: true,
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      email: "",
      role: "team_member",
      manager_username: "",
    },
  });

  useEffect(() => {
    setShowNavbar(!open);
    return () => {
      setShowNavbar(true);
    };
  }, [open, setShowNavbar]);

  const onRegisterSubmit = async (data) => {
    try {
      // Only fetch manager's ID if the user is a team member
      let manager_id = null;

      if (data.role === "team_member") {
        // Fetch the manager's user ID
        const managerResponse = await fetch(
          `${proxy}/user/username/${data.manager_username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const managerData = await managerResponse.json();

        if (managerResponse.status !== 200) {
          setFeedbackMessage({
            title: "Manager Not Found",
            description: "The provided manager username does not exist.",
          });
          return;
        }

        manager_id = managerData.id;
      }

      // Register the new user
      const registerResponse = await fetch(`${proxy}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          display_name: data.displayName,
          email: data.email,
          username: data.username,
          password_hash: data.password,
          role: data.role,
          manager_id,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.status === 201) {
        setFeedbackMessage({
          title: "Registration Successful",
          description: "You have successfully registered.",
        });

        // Update login form with the registered username for convenience
        loginForm.setValue("username", data.username);

        // Reset register form
        registerForm.reset({
          username: "",
          password: "",
          displayName: "",
          email: "",
          role: "team_member",
          manager_username: "",
        });

        setOpen(false);
      } else {
        setFeedbackMessage({
          title: "Registration Failed",
          description:
            registerData.message || "An error occurred while registering.",
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        title: "Registration Failed",
        description: "An error occurred while trying to register.",
      });
    }
  };

  // Replace your logout handler with:
  const handleLogout = async () => {
    const result = await logout();

    if (result.success) {
      setFeedbackMessage({
        title: "Logout Successful",
        description: "You have successfully logged out.",
      });
    } else {
      setFeedbackMessage({
        title: "Logout Failed",
        description: result.error,
      });
    }
  };

  return (
    <div className="animate-fadein">
      <div className="grid grid-cols-2 h-screen">
        <Card className="flex flex-col justify-center p-5 bg-primary-foreground/20 border-0 rounded-none">
          <CardHeader>
            <CardTitle className="text-7xl font-extrabold">CTMS.</CardTitle>
            <CardDescription className="text-5xl font-extralight">
              The next generation of Task Management.
            </CardDescription>
          </CardHeader>
        </Card>

        {user ? (
          <Card className="flex flex-col items-center justify-center bg-primary-foreground/70 border-0 rounded-none">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome back, {user.display_name}
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Logout
                <LogIn className="ml-2" size={20} />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col justify-center bg-primary-foreground/70 border-0 rounded-none">
            <CardHeader className="space-y-4 text-center">
              <CardTitle className="text-2xl ">Login to myCMTS</CardTitle>
              <Separator />
            </CardHeader>

            {/* Login Form with Shadcn UI */}
            <CardContent>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="flex flex-col space-y-4 w-1/2 m-auto"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User strokeWidth={2} size={18} /> Username
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock strokeWidth={2} size={18} /> Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="isRemembered"
                    render={({ field }) => (
                      <FormItem className="flex flex-row w-full items-center justify-center">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Remember Me</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    Login <LogIn />
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <div className="space-y-2 text-center w-full">
                <h2 className="text-xl font-semibold ">New Here?</h2>
                <p>Sign up to start tracking your progress.</p>

                {/* Registration Dialog with Shadcn UI */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-1/2 ">
                      Sign Up
                      <ChartSpline />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[600px] ">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        Register
                      </DialogTitle>
                      <DialogDescription>
                        Let's get you started on your journey with our intuitive
                        task manager.
                      </DialogDescription>
                    </DialogHeader>

                    <Separator />

                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="flex flex-col space-y-4"
                      >
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User strokeWidth={2} size={18} /> Username
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your unique username"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Lock strokeWidth={2} size={18} /> Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Contact strokeWidth={2} size={18} /> Display
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your display name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Mail strokeWidth={2} size={18} /> Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-md">
                                User Role
                              </FormLabel>
                              <div className="flex space-x-4 justify-center text-center">
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex space-x-4 w-full"
                                >
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <label>
                                        <RadioGroupItem
                                          value="team_member"
                                          className="sr-only"
                                        />
                                        <Badge
                                          variant={
                                            field.value === "team_member"
                                              ? "default"
                                              : "outline"
                                          }
                                          className={`w-full py-3 hover:bg-primary/90 cursor-pointer transition-colors
                                                    ${
                                                      field.value ===
                                                      "team_member"
                                                        ? ""
                                                        : "hover:bg-secondary/80"
                                                    }`}
                                        >
                                          <div className="flex items-center justify-center gap-2">
                                            <CircleUserRound
                                              size={20}
                                              strokeWidth={2}
                                            />
                                            <span>Team Member</span>
                                          </div>
                                        </Badge>
                                      </label>
                                    </FormControl>
                                  </FormItem>

                                  <FormItem className="w-full">
                                    <FormControl>
                                      <label>
                                        <RadioGroupItem
                                          value="admin"
                                          className="sr-only"
                                        />
                                        <Badge
                                          variant={
                                            field.value === "admin"
                                              ? "default"
                                              : "outline"
                                          }
                                          className={`w-full py-3 hover:bg-primary/90 cursor-pointer transition-colors
                                                      ${
                                                        field.value === "admin"
                                                          ? ""
                                                          : "hover:bg-secondary/80"
                                                      }`}
                                        >
                                          <div className="flex items-center justify-center gap-2">
                                            <Shield size={20} strokeWidth={2} />
                                            <span>Admin</span>
                                          </div>
                                        </Badge>
                                      </label>
                                    </FormControl>
                                  </FormItem>
                                </RadioGroup>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="manager_username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserCog strokeWidth={2} size={18} /> Admin's
                                Username
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your Admin's username"
                                  className={`
                                    ${
                                      registerForm.watch("role") === "admin"
                                        ? "opacity-50"
                                        : ""
                                    }`}
                                  disabled={
                                    registerForm.watch("role") === "admin"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" variant="default">
                            Register
                            <TrendingUp />
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
