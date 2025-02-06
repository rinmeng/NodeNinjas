import React from "react";
import {
  Users,
  Shield,
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

const About = () => {
  return (
    <div className="animate-fadein bg-slate-900 min-h-screen text-white px-10 py-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold mb-8 text-center">About CTMS</h1>
        <p className="text-xl text-slate-300 text-center mb-12">
          Collaborative Task Management System (CTMS) is designed to streamline
          team productivity, enhance collaboration, and simplify task
          management. Whether you're an admin or a team member, CTMS empowers
          you to achieve more, together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <Users className="w-12 h-12 mb-4 text-blue-500" />
            <h2 className="text-2xl font-semibold mb-2">User Roles & Access</h2>
            <p className="text-slate-300">
              Secure login with role-based access control. Admins manage users
              and tasks, while team members focus on their assignments.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <ListChecks className="w-12 h-12 mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-2">Task Management</h2>
            <p className="text-slate-300">
              Create, assign, and track tasks with details like title,
              description, priority, due date, and status.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <Bell className="w-12 h-12 mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold mb-2">
              Real-Time Notifications
            </h2>
            <p className="text-slate-300">
              Get notified instantly when tasks are assigned or updated.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <Calendar className="w-12 h-12 mb-4 text-purple-500" />
            <h2 className="text-2xl font-semibold mb-2">
              Task Search & Filters
            </h2>
            <p className="text-slate-300">
              Search tasks by date, assigned users, priority, or status for
              better organization.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <BarChart className="w-12 h-12 mb-4 text-pink-500" />
            <h2 className="text-2xl font-semibold mb-2">Admin Dashboard</h2>
            <p className="text-slate-300">
              Track task progress, team performance, and deadlines with
              comprehensive analytics.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <MessageCircle className="w-12 h-12 mb-4 text-indigo-500" />
            <h2 className="text-2xl font-semibold mb-2">Live Messaging</h2>
            <p className="text-slate-300">
              Communicate seamlessly with your team using built-in live
              messaging.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-4xl font-bold mb-6">Why Choose CTMS?</h2>
          <p className="text-slate-300 text-lg mb-8">
            CTMS is built with security, scalability, and simplicity in mind.
            Our system ensures your data is safe, your workflows are efficient,
            and your team stays connected.
          </p>
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Lock className="w-6 h-6 text-blue-500" />
              <span className="text-lg">Secure & Reliable</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-green-500" />
              <span className="text-lg">RESTful APIs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-purple-500" />
              <span className="text-lg">Database-Driven</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-yellow-500" />
              <span className="text-lg">Comprehensive Documentation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
