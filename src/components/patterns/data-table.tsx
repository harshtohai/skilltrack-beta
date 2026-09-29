"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/patterns/skeleton";
import { EmptyState } from "~/components/patterns/empty-state";

/**
 * DataTable per design §4.5: Card container p-0, tinted header row, sortable
 * columns (ChevronsUpDown), optional global search (w-56), bulk bar replacing
 * the toolbar on selection, skeleton rows while loading, empty state, footer
 * with count + pagination (numbers max 5). Mobile: `mobileCard` render prop
 * renders each row as a stacked card at <md, else the table scrolls.
 * Note: pinned to @tanstack/react-table v8 (classic useReactTable API) — see
 * idea bag item 17.
 */

const SKELETON_ROWS = 5;

function DataTable<TData>({
  columns,
  data,
  loading = false,
  title,
  toolbar,
  searchPlaceholder,
  mobileCard,
  emptyState,
  pageSize = 10,
  className,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  title?: string;
  /** Extra toolbar controls right of search (primary add button, kebab). */
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  /** Renders a row as a stacked card at <md (§11). Omit to scroll horizontally. */
  mobileCard?: (row: TData) => React.ReactNode;
  emptyState?: React.ReactNode;
  pageSize?: number;
  className?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
  });

  const selectedCount = Object.keys(rowSelection).length;
  const rowCount = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const pageTotal = Math.max(1, table.getPageCount());
  const from = rowCount === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1;
  const to = Math.min(rowCount, (pageIndex + 1) * table.getState().pagination.pageSize);
  const rows = table.getRowModel().rows;

  // Page numbers: max 5 with ellipsis per §4.5.
  const pageNumbers = React.useMemo(() => {
    if (pageTotal <= 5) return Array.from({ length: pageTotal }, (_, i) => i);
    const start = Math.max(0, Math.min(pageIndex - 2, pageTotal - 5));
    return Array.from({ length: 5 }, (_, i) => start + i);
  }, [pageIndex, pageTotal]);

  const allSelected = rows.length > 0 && rows.every((r) => rowSelection[r.id]);
  const someSelected = rows.some((r) => rowSelection[r.id]);

  return (
    <div
      data-slot="data-table"
      className={cn(
        "rounded-xl border bg-card text-card-foreground p-0 overflow-hidden",
        className,
      )}
    >
      {/* Toolbar — its own zone (one primary max, CL-05). Bulk bar replaces it. */}
      {selectedCount > 0 ? (
        <div className="flex items-center justify-between gap-2 border-b bg-primary-soft p-4">
          <p className="text-body-sm font-medium text-primary-strong tabular-nums">
            {selectedCount} selected
          </p>
          <div className="flex items-center gap-2">
            {toolbar}
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              Clear
            </Button>
          </div>
        </div>
      ) : title || searchPlaceholder || toolbar ? (
        <div className="flex flex-col gap-2 p-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? (
            <p className="text-title font-medium">{title}</p>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {searchPlaceholder ? (
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full border-transparent bg-muted hover:border-input focus-visible:border-input sm:w-56"
                aria-label={searchPlaceholder}
              />
            ) : null}
            {toolbar}
          </div>
        </div>
      ) : null}

      {/* Mobile card list */}
      {mobileCard && !loading && (
        <div className="p-4 md:hidden">
          {rows.length === 0 ? (
            emptyState
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  {mobileCard(row.original)}
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-caption text-muted-foreground">
            <span className="tabular-nums">
              Page {pageIndex + 1} of {pageTotal}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table (hidden on mobile when mobileCard provided) */}
      <div className={cn(mobileCard && "hidden md:block")}>
        <div className="w-full overflow-x-auto">
          <table className="w-full caption-bottom text-body-sm">
            <thead className="bg-muted/60 [&_tr]:border-y">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="h-10">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : undefined
                        }
                        className="px-4 text-left align-middle text-caption font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 rounded-sm text-caption font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3.5 text-foreground" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3.5 text-foreground" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="h-12 border-b last:border-0">
                    {table.getVisibleFlatColumns().map((cell) => (
                      <td key={cell.id} className="px-4 first:pl-5 last:pr-5">
                        <Skeleton className="h-5 w-full max-w-32" delay={false} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getVisibleFlatColumns().length}
                    className="px-5"
                  >
                    {emptyState ?? (
                      <EmptyState
                        title="No results"
                        description="Try adjusting your filters."
                      />
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="h-12 border-b transition-colors duration-150 last:border-0 hover:bg-muted/40 data-[state=selected]:bg-primary-soft"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 align-middle first:pl-5 last:pr-5"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count left, pagination right */}
        {!loading && rows.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-t p-4 text-caption text-muted-foreground">
            <span className="tabular-nums">
              Showing {from}–{to} of {rowCount}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === pageIndex ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => table.setPageIndex(p)}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === pageIndex ? "page" : undefined}
                  className="tabular-nums"
                >
                  {p + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Selection checkbox column factory (§4.5 — col width 40px). */
function selectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "__select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => {
      const rows = table.getRowModel().rows;
      const all = rows.length > 0 && rows.every((r) => r.getIsSelected());
      const some = rows.some((r) => r.getIsSelected());
      return (
        <Checkbox
          aria-label="Select all"
          checked={all ? true : some ? "indeterminate" : false}
          onCheckedChange={(v) => table.toggleAllRowsSelected(v === true)}
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(v === true)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };
}

/** Kebab row-actions cell (§4.5 — ≤2 visible actions, else kebab, CL-19). */
function rowActionsColumn<TData>(
  render: (row: TData) => React.ReactNode,
): ColumnDef<TData, unknown> {
  return {
    id: "__actions",
    size: 48,
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-end">
        {render(row.original)}
      </span>
    ),
  };
}

export { DataTable, selectColumn, rowActionsColumn };
