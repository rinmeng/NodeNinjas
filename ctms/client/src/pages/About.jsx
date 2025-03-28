import React from "react";
import {
  Users,
  Bell,
  Calendar,
  ListChecks,
  BarChart,
  MessageCircle,
  Lock,
  Code,
  Database,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

//Testing
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-foreground/80" />
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm sm:text-base text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const About = () => {
  const features = [
    {
      icon: Users,
      title: "User Roles & Access",
      description:
        "Secure login with role-based access control. Admins manage users and tasks, while team members focus on their assignments.",
    },
    {
      icon: ListChecks,
      title: "Task Management",
      description:
        "Create, assign, and track tasks with details like title, description, priority, due date, and status.",
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description: "Get notified instantly when tasks are assigned or updated.",
    },
    {
      icon: Calendar,
      title: "Task Search & Filters",
      description:
        "Search tasks by date, assigned users, priority, or status for better organization.",
    },
    {
      icon: BarChart,
      title: "Admin Dashboard",
      description:
        "Track task progress, team performance, and deadlines with comprehensive analytics.",
    },
    {
      icon: MessageCircle,
      title: "Live Messaging",
      description:
        "Communicate seamlessly with your team using built-in live messaging.",
    },
  ];

  return (
    <div className="container px-4 py-8 md:p-8 lg:p-12 animate-fade-in w-full mx-auto my-8 sm:my-16">
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
            About CTMS
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Collaborative Task Management System (CTMS) is designed to
            streamline team productivity, enhance collaboration, and simplify
            task management. Whether you're an admin or a team member, CTMS
            empowers you to achieve more, together.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      <Card className="mt-6 sm:mt-8">
        <CardHeader>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            Why Choose CTMS?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center">
            CTMS is built with security, scalability, and simplicity in mind.
            Our system ensures your data is safe, your workflows are efficient,
            and your team stays connected.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Badge
              variant="secondary"
              className="text-sm sm:text-lg py-1 sm:py-2 px-2 sm:px-4"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Secure & Reliable
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm sm:text-lg py-1 sm:py-2 px-2 sm:px-4"
            >
              <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              RESTful APIs
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm sm:text-lg py-1 sm:py-2 px-2 sm:px-4"
            >
              <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Database-Driven
            </Badge>
            <Badge
              variant="secondary"
              className="text-sm sm:text-lg py-1 sm:py-2 px-2 sm:px-4"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Comprehensive Documentation
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
