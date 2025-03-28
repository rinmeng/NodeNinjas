import React, { useState } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { User, Lock, LogIn, ChartSpline } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/utils/ToastProvider";
import { RegisterPanel } from "@/src/components/RegisterPanel";

// Define your validation schemas with Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  isRemembered: z.boolean().default(true),
});

const Login = () => {
  const { user, login, logout } = useAuth();
  const { setFeedbackMessage } = useToast();
  const [open, setOpen] = useState(false);

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

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      isRemembered: true,
    },
  });

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
    <div className="animate-fade-in">
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

                <RegisterPanel isAdmin={false} />
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
