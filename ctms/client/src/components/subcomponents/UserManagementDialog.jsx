import React, { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DataTable from "@/src/components/DataTable";
import { createUserColumns } from "./UserColumns";

function UserManagementDialog({
  usersList,
  isLoading,
  isRefetching,
  isDeleting,
  setIsDeleting,
  fetchUsers,
  sortUsers,
  sortDirection,
  onDeleteUsers,
  onRoleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [chosenUserIds, setChosenUserIds] = useState([]);
  const [tableRef, setTableRef] = useState({ current: null });

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      resetSelection();
    }
  };

  const resetSelection = () => {
    setChosenUserIds([]);
    if (tableRef.current) {
      tableRef.current.resetRowSelection();
    }
  };

  const handleDelete = () => {
    if (chosenUserIds.length === 0) return;
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    const success = await onDeleteUsers(
      deleteUser ? [deleteUser.id] : chosenUserIds
    );
    if (success) {
      resetSelection();
    }
    setIsDeleting(false);
    setDeleteUser(null);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteUser(null);
    setChosenUserIds([]);
    if (tableRef.current) {
      tableRef.current.resetRowSelection();
    }
  };

  const usersColumns = createUserColumns(
    sortDirection,
    sortUsers,
    (userId, newRole) => {
      if (onRoleChange) {
        onRoleChange(userId, newRole);
      }
    },
    (user) => {
      setDeleteUser(user);
      setIsDeleting(true);
    }
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">Manage Users</Button>
        </DialogTrigger>

        <DialogContent className="min-w-[90vw] md:min-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-4 text-xl">
              Manage Users
              <Button
                variant="default"
                size="sm"
                onClick={fetchUsers}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${
                    isLoading || isRefetching ? "animate-spin" : ""
                  }`}
                />
                Sync Users
              </Button>
            </DialogTitle>
            <DialogDescription>
              View and manage all users in the system
            </DialogDescription>
          </DialogHeader>

          <DataTable
            columns={usersColumns}
            data={usersList}
            loading={isLoading}
            initialPageSize={5}
            onSelectionChange={setChosenUserIds}
            tableRef={setTableRef}
          />

          <DialogFooter>
            {chosenUserIds.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected ({chosenUserIds.length})
                </Button>
                <Button variant="outline" size="sm" onClick={resetSelection}>
                  Clear Selection
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={isDeleting}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {deleteUser
                ? `Would you like to delete ${
                    deleteUser.display_name || deleteUser.username
                  }? This action is irreversible!`
                : `You are about to delete these ${chosenUserIds.length} users. This action is irreversible!`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Don't Delete
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Selected User(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserManagementDialog;
