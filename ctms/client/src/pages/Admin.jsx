import React from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/utils/AuthProvider";
import { RegisterPanel } from "@/src/components/RegisterPanel";
import useUserManagement from "@/hooks/useUserManagement";
import UserManagementDialog from "@/src/components/subcomponents/UserManagementDialog";
import AnalyticsDashboard from "@/src/components/subcomponents/AnalyticsDashboard";

function Admin({ devMode }) {
  const { user } = useAuth();

  const {
    usersList,
    isLoading,
    isRefetching,
    fetchUsers,
    sortUsers,
    deleteUsers,
    updateUserRole,
  } = useUserManagement(user, devMode);

  const handleUserAdded = () => {
    // Refresh the users list when a new user is added
    fetchUsers();
  };

  if ((!user || user.role !== "admin") && !devMode) {
    return (
      <div className="mp5 my-16 animate-fadein">
        <h1 className="title text-center">Welcome to the Admin Page!</h1>
        <p className="text-center text-xl">
          Please log in as admin to view this page, or enable{" "}
          <code>devMode</code> to bypass authentication in <code>App.jsx</code>
        </p>
        <Navigate to="/login" />
      </div>
    );
  }

  return (
    <div className="w-full my-30 animate-fade-in">
      {/* Admin Controls Card */}
      <Card className="container mx-auto flex flex-col items-center">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-semibold">Admin Functionality</h2>
          </CardTitle>
          <CardDescription>Manage users, roles, and more.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          {/* User Management Dialog */}
          <UserManagementDialog
            usersList={usersList}
            isLoading={isLoading}
            isRefetching={isRefetching}
            fetchUsers={fetchUsers}
            sortUsers={sortUsers}
            onDeleteUsers={deleteUsers}
            onRoleChange={updateUserRole}
          />

          {/* Register New User Panel */}
          <RegisterPanel isAdmin={true} onUserAdded={handleUserAdded} />

          {/* Placeholder for future functionality */}
          <Button className="w-full md:w-auto">To Be Added</Button>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}

export default Admin;
