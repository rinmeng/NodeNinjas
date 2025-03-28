import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Lock,
  Contact,
  Mail,
  CircleUserRound,
  Shield,
  UserCog,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/utils/ToastProvider";
import proxy from "@/utils/proxy";
import { useAuth } from "@/utils/AuthProvider"; // Add this to get current admin user

export function RegisterPanel({ isAdmin, onUserAdded }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth(); // Add this to get current admin user
  const registerForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      email: "",
      role: "team_member",
      manager_username: "",
    },
  });
  const { setFeedbackMessage } = useToast();

  const onRegisterSubmit = async (data) => {
    try {
      let manager_id = null;

      // If admin is registering, use their ID as manager_id
      if (isAdmin) {
        manager_id = user.id; // Current admin's ID
        data.role = "team_member"; // Force role to team_member
      } else if (data.role === "team_member") {
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
          role: data.role, // Always set to team_member when admin is registering
          manager_id, // This will be the admin's ID
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.status === 201) {
        setFeedbackMessage({
          title: "Registration Successful",
          description: isAdmin
            ? "Team member has been successfully added."
            : "You have successfully registered.",
        });

        registerForm.reset({
          username: "",
          password: "",
          displayName: "",
          email: "",
          role: "team_member",
          manager_username: "",
        });

        setOpen(false);

        // If there's a callback for refreshing the users list in Admin panel
        if (isAdmin && onUserAdded) {
          onUserAdded();
        }
      } else {
        setFeedbackMessage({
          title: "Registration Failed",
          description:
            registerData.message || "An error occurred while registering.",
        });
      }
    } catch (error) {
      setFeedbackMessage({
        title: "Registration Failed",
        description: "An error occurred while trying to register.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={isAdmin ? "w-full md:w-auto" : "w-1/2"}>
          {isAdmin ? (
            "Add User"
          ) : (
            <>
              Sign Up
              <TrendingUp />
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isAdmin ? "Add Team Member" : "Register"}
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Add a new team member to the system."
              : "Let's get you started on your journey with our intuitive task manager."}
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
                    <Contact strokeWidth={2} size={18} /> Display Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
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

            {!isAdmin && (
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
                                className={`w-full py-3 hover:bg-primary/90 cursor-pointer transition-colors ${
                                  field.value === "team_member"
                                    ? ""
                                    : "hover:bg-secondary/80"
                                }`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <CircleUserRound size={20} strokeWidth={2} />
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
                                className={`w-full py-3 hover:bg-primary/90 cursor-pointer transition-colors ${
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
            )}

            {!isAdmin && registerForm.watch("role") === "team_member" && (
              <FormField
                control={registerForm.control}
                name="manager_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCog strokeWidth={2} size={18} /> Admin's Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Admin's username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                {isAdmin ? "Add Team Member" : "Register"}
                <TrendingUp />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
