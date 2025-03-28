import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useAuth } from "@/utils/AuthProvider";

// Form validation schema
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["team_member", "admin"]),
  manager_username: z.string().optional(),
});

// Form field configurations
const formFields = [
  {
    name: "username",
    label: "Username",
    icon: User,
    type: "text",
    placeholder: "Enter your unique username",
  },
  {
    name: "password",
    label: "Password",
    icon: Lock,
    type: "password",
    placeholder: "Enter your password",
  },
  {
    name: "displayName",
    label: "Display Name",
    icon: Contact,
    type: "text",
    placeholder: "Enter your display name",
  },
  {
    name: "email",
    label: "Email",
    icon: Mail,
    type: "email",
    placeholder: "Enter your email",
  },
];

export function RegisterPanel({ isAdmin, onUserAdded }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { setFeedbackMessage } = useToast();

  const registerForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      email: "",
      role: "team_member",
      manager_username: "",
    },
  });

  // Helper function to verify manager
  const verifyManager = async (managerUsername) => {
    try {
      const response = await fetch(`${proxy}/user/username/${managerUsername}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Manager not found");
      }

      const managerData = await response.json();
      
      if (managerData.role !== "admin") {
        throw new Error("Invalid manager role");
      }

      return managerData.id;
    } catch (error) {
      throw error;
    }
  };

  // Helper function to register user
  const registerUser = async (userData) => {
    const response = await fetch(`${proxy}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  };

  const onRegisterSubmit = async (data) => {
    try {
      let manager_id = null;

      // Handle manager ID assignment
      if (isAdmin) {
        manager_id = user.id;
      } else if (data.role === "team_member") {
        try {
          manager_id = await verifyManager(data.manager_username);
        } catch (error) {
          setFeedbackMessage({
            title: "Manager Verification Failed",
            description: error.message === "Invalid manager role" 
              ? "The provided username is not an admin."
              : "The provided manager username does not exist.",
          });
          return;
        }
      }

      // Prepare user data
      const userData = {
        display_name: data.displayName,
        email: data.email,
        username: data.username,
        password_hash: data.password,
        role: isAdmin ? "team_member" : data.role,
        manager_id,
      };

      // Register user
      await registerUser(userData);

      setFeedbackMessage({
        title: "Registration Successful",
        description: isAdmin
          ? "Team member has been successfully added."
          : "You have successfully registered.",
      });

      registerForm.reset();
      setOpen(false);

      if (isAdmin && onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFeedbackMessage({
        title: "Registration Failed",
        description: "An error occurred while trying to register.",
      });
    }
  };

  // Render form field
  const renderFormField = ({ name, label, icon: Icon, type, placeholder }) => (
    <FormField
      key={name}
      control={registerForm.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Icon strokeWidth={2} size={18} /> {label}
          </FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={isAdmin ? "w-full md:w-auto" : "w-1/2"}>
          {isAdmin ? (
            "Onboard Member"
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
            {formFields.map(renderFormField)}

            {!isAdmin && (
              <FormField
                control={registerForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-md">
                      User Role
                    </FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4 w-full"
                    >
                      {[
                        {
                          value: "team_member",
                          label: "Team Member",
                          icon: CircleUserRound,
                        },
                        {
                          value: "admin",
                          label: "Admin",
                          icon: Shield,
                        },
                      ].map(({ value, label, icon: Icon }) => (
                        <FormItem key={value} className="w-full">
                          <FormControl>
                            <label>
                              <RadioGroupItem
                                value={value}
                                className="sr-only"
                              />
                              <Badge
                                variant={field.value === value ? "default" : "outline"}
                                className={`w-full py-3 hover:bg-primary/90 cursor-pointer transition-colors ${
                                  field.value === value ? "" : "hover:bg-secondary/80"
                                }`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <Icon size={20} strokeWidth={2} />
                                  <span>{label}</span>
                                </div>
                              </Badge>
                            </label>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
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
