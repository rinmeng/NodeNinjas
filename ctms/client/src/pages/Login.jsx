import React, { useState, useEffect } from "react";
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
import IconizedButton from "../components/subcomponents/IconizedButton";
import TickCheckbox from "../components/subcomponents/TickCheckbox";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const Login = ({
  setShowNavbar,
  sessionUser,
  setSessionUser,
  setFeedbackMessage,
}) => {
  const [open, setOpen] = useState(false);

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

  const onLoginSubmit = async (data) => {
    try {
      const response = await fetch(`${proxy}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: data.username,
          password_hash: data.password,
          isRemembered: data.isRemembered,
        }),
      });

      const responseData = await response.json();

      if (response.status === 200) {
        setFeedbackMessage({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });
        setSessionUser(responseData.session.user);
      } else if (response.status === 401 || response.status === 404) {
        setFeedbackMessage({
          title: "Invalid Credentials",
          description: "Username or password is incorrect.",
        });
      } else {
        setFeedbackMessage({
          title: "Login Failed",
          description: "An error occurred while trying to log in.",
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        title: "Login Failed",
        description: "An error occurred while trying to log in.",
      });
    }
  };

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

  const userLogout = async () => {
    try {
      const response = await fetch(`${proxy}/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 200) {
        setFeedbackMessage({
          title: "Logout Successful",
          description: "You have successfully logged out.",
        });

        setSessionUser(null);
        loginForm.reset();
      } else {
        setFeedbackMessage({
          title: "Logout Failed",
          description: "An error occurred while trying to log out.",
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        title: "Logout Failed",
        description: "An error occurred while trying to log out.",
      });
    }
  };

  return (
    <div className="animate-fadein">
      <div className="grid grid-cols-2 h-screen">
        <div className="flex flex-col justify-center p-5 bg-slate-950">
          <h1 className="text-7xl font-extrabold text-left">CTMS.</h1>
          <p className="text-5xl font-extralight">
            The next generation of Task Management.
          </p>
        </div>
        {sessionUser ? (
          <div className="flex flex-col items-center justify-center bg-slate-900">
            <h1 className="title text-white">
              {sessionUser
                ? `Welcome back, ${sessionUser.display_name}`
                : "Login to myCMTS"}
            </h1>
            <hr className="w-1/4 m-auto my-4" />
            <IconizedButton
              text="Logout"
              btnStyle="btn-red w-1/2"
              icon={<LogIn className="ml-2" size={20} strokeWidth={2} />}
              onClick={userLogout}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center bg-slate-900 p-5">
            <div className="space-y-4 text-center">
              <h1 className="title text-white">Login to myCMTS</h1>
              <hr className="w-1/4 m-auto my-4" />

              {/* Login Form with Shadcn UI */}
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
                          <Input
                            placeholder="Enter your username"
                            className="bg-slate-800 border-slate-700 text-white"
                            {...field}
                          />
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
                            className="bg-slate-800 border-slate-700 text-white"
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
                      <FormItem className="flex flex-row justify-center items-center space-x-2 space-y-0">
                        <FormControl>
                          <TickCheckbox
                            checked={field.value}
                            onChange={field.onChange}
                            label="Remember Me"
                            name="isRemembered"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    Login <LogIn />
                  </Button>
                </form>
              </Form>
            </div>

            <hr className="w-1/2 m-auto my-4" />

            <div className="space-y-2 text-center">
              <h1 className="title-sm text-white">New Here?</h1>
              <div className="flex flex-col space-y-4 w-1/2 m-auto">
                <p>Sign up to start tracking your progress.</p>

                {/* Registration Dialog with Shadcn UI */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-200">
                      Sign Up
                      <ChartSpline />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[600px] bg-slate-700 text-white border-slate-600">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        Register
                      </DialogTitle>
                      <DialogDescription className="text-slate-200 text-lg">
                        Let's get you started on your journey with our intuitive
                        task manager.
                      </DialogDescription>
                    </DialogHeader>

                    {/* make a vertical separator */}
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
                                <User /> Username
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your unique username"
                                  className="bg-slate-800 border-slate-700 text-white"
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
                                <Lock /> Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  className="bg-slate-800 border-slate-700 text-white"
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
                                  className="bg-slate-800 border-slate-700 text-white"
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
                                  className="bg-slate-800 border-slate-700 text-white"
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
                                        <div
                                          className={`p-2 border-2 t200e font-bold border-slate-500 
                                          bg-slate-700 rounded-full flex justify-center items-center space-x-2
                                          ${
                                            field.value === "team_member"
                                              ? "bg-slate-950 border-slate-300 text-white"
                                              : ""
                                          }`}
                                        >
                                          <p>Team Member</p>
                                          <CircleUserRound
                                            size={20}
                                            strokeWidth={2}
                                          />
                                        </div>
                                      </label>
                                    </FormControl>
                                  </FormItem>

                                  <FormItem className="w-full">
                                    <FormControl>
                                      <label className="cursor-pointer">
                                        <RadioGroupItem
                                          value="admin"
                                          className="sr-only"
                                        />
                                        <div
                                          className={`p-2 border-2 t200e font-bold border-slate-500 
                                          bg-slate-700 rounded-full flex justify-center items-center space-x-2
                                          ${
                                            field.value === "admin"
                                              ? "bg-slate-950 border-slate-300 text-white"
                                              : ""
                                          }`}
                                        >
                                          <p>Admin</p>
                                          <Shield size={20} strokeWidth={2} />
                                        </div>
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
                                  className={`bg-slate-800 border-slate-700 text-white
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
                            className="bg-transparent border-slate-400 text-white hover:bg-slate-600"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-white text-slate-900 hover:bg-slate-200"
                          >
                            Register
                            <TrendingUp
                              size={20}
                              className="ml-2"
                              strokeWidth={2}
                            />
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
