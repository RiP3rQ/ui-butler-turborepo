"use client";
import type { FavoritedComponent } from "@shared/types";
import { DataTableColumnHeader } from "@shared/ui/components/table/data-table-header";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { ActionsTableColumns } from "./table-actions-column";

export const columns: ColumnDef<FavoritedComponent>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="text-xl font-semibold">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.projectName}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CreatedAt" />
    ),
    cell: ({ row }) => {
      const date = moment(row.original.createdAt).format("DD.MM.YYYY");
      return <div>{date}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UpdatedAt" />
    ),
    cell: ({ row }) => {
      const date = moment(row.original.updatedAt).format("DD.MM.YYYY");
      return <div>{date}</div>;
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <ActionsTableColumns row={row} />,
  },
];
