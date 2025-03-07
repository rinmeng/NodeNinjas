import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  initialPageSize = 10,
  onSelectionChange = null,
  tableRef = null,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableFields = ["username", "email", "id", "role"];

      // If value is empty, return all rows
      if (!filterValue) return true;

      // Convert search term to lowercase for case-insensitive search
      const searchTerm = filterValue.toLowerCase();

      // Check if any searchable field in the row contains the search term
      return searchableFields.some((field) => {
        const value = row.getValue(field);
        return value?.toString().toLowerCase().includes(searchTerm);
      });
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(newSelection);

      // Call the callback with selected row IDs if provided
      if (onSelectionChange) {
        const selectedIds = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => {
            const rowIndex = parseInt(key);
            return data[rowIndex]?.id;
          })
          .filter((id) => id);

        onSelectionChange(selectedIds);
      }
    },
    onPaginationChange: (updater) => {
      // Handle pagination state changes
      const newPaginationState =
        typeof updater === "function"
          ? updater(table.getState().pagination)
          : updater;

      setPageIndex(newPaginationState.pageIndex);
      setPageSize(newPaginationState.pageSize);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize: pageSize,
        pageIndex: pageIndex,
      },
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  useEffect(() => {
    if (tableRef) {
      tableRef.current = table;
    }
  }, [table, tableRef]);

  useEffect(() => {
    // Register a custom global filter function
    table.setGlobalFilter(table.getState().globalFilter);
  }, [table]);

  return (
    <Card className="w-full h-full">
      <CardContent>
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder="Search users by username, email, id, or role..."
            value={table.getState().globalFilter || ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page Size Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {pageSize} rows <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[5, 10].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    table.setPageSize(size);
                  }}
                >
                  {size} rows
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Syncing Users...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Add empty rows to maintain consistent height */}
                  {table.getRowModel().rows.length < pageSize &&
                    Array(pageSize - table.getRowModel().rows.length)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow
                          key={`empty-${index}`}
                          className="h-12 border-none pointer-events-none"
                        >
                          {Array(columns.length)
                            .fill(0)
                            .map((_, cellIndex) => (
                              <TableCell key={`empty-cell-${cellIndex}`}>
                                &nbsp;
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                </>
              ) : (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-12 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                  {/* Add empty rows when there are no results */}
                  {Array(pageSize - 1)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow
                        key={`empty-${index}`}
                        className="h-12 border-none pointer-events-none"
                      >
                        {Array(columns.length)
                          .fill(0)
                          .map((_, cellIndex) => (
                            <TableCell key={`empty-cell-${cellIndex}`}>
                              &nbsp;
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2 flex items-center">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
