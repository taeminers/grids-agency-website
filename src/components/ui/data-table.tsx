// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
"use client";

import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Check,
  Copy,
  Table,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/action-button";
import { Checkbox } from "@/components/ui/choice-controls";
import { Panel, Shell, ShellHeader } from "@/components/ui/surface";
import { SearchField } from "@/components/ui/text-field";
import { enter, exit } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export type DataRow = { id: string } & Record<string, string | number | null>;

export type DataColumn<R extends DataRow = DataRow> = {
  key: keyof R & string;
  label: string;
  align?: "left" | "right";
  /** Display text for a cell. Sorting and CSV use the raw value. */
  format?: (value: R[keyof R], row: R) => React.ReactNode;
  sortable?: boolean;
  /** Narrow columns don't grow. */
  width?: string;
  /**
   * Which columns survive a narrow table: 1 always shows, 2 hides below a
   * 28rem-wide table, 3 below 36rem. Defaults to 1 for the first two columns,
   * 2 for the next two and 3 after that.
   */
  priority?: 1 | 2 | 3;
};

const hideBelow = {
  1: "",
  2: "hidden @md:table-cell",
  3: "hidden @xl:table-cell",
} as const;
const priorityOf = (c: { priority?: 1 | 2 | 3 }, i: number) =>
  hideBelow[c.priority ?? (i < 2 ? 1 : i < 4 ? 2 : 3)];

export type DataTableLabels = {
  filter: string;
  clearSearch: string;
  copy: string;
  copied: string;
  empty: string;
  emptyDescription: string;
  previous: string;
  next: string;
  clear: string;
  selectAll: string;
  selectRow: (name: string) => string;
  rowCount: (count: number) => string;
  selectedCount: (count: number) => string;
  range: (from: number, to: number, total: number) => string;
};
const defaultLabels: DataTableLabels = {
  filter: "Filter rows", clearSearch: "Clear search", copy: "Copy as CSV",
  copied: "Copied as CSV", empty: "No rows match", emptyDescription: "Try a different search.",
  previous: "Previous page", next: "Next page", clear: "Clear",
  selectAll: "Select all rows on this page", selectRow: (name) => `Select ${name}`,
  rowCount: (count) => `${count} rows`, selectedCount: (count) => `${count} selected`,
  range: (from, to, total) => `${from}–${to} of ${total}`,
};

export type DataTableProps<R extends DataRow = DataRow> = {
  data: R[];
  columns: DataColumn<R>[];
  title: string;
  subtitle?: string;
  /** Rows per page. */
  pageSize?: number;
  /** Show the filter field above the table. */
  searchable?: boolean;
  /** Show the CSV copy action in the header. */
  copyable?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Bulk actions shown when rows are selected. */
  actions?: (ids: string[]) => React.ReactNode;
  onRowClick?: (row: R) => void;
  className?: string;
  labels?: Partial<DataTableLabels>;
  /** Omit pagination for small, single-page previews. */
  paginated?: boolean;
  /** Minimum table width; enables horizontal scrolling in compact containers. */
  tableMinWidth?: number;
};

type Sort = { key: string; dir: "asc" | "desc" } | null;

const compare = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });

const csvCell = (v: unknown) => {
  const text = String(v ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function DataTable<R extends DataRow>({
  data,
  columns,
  title,
  subtitle,
  pageSize = 6,
  searchable = true,
  copyable = true,
  selectable = false,
  selected: selectedProp,
  onSelectedChange,
  actions,
  onRowClick,
  className,
  labels: labelOverrides,
  paginated = true,
  tableMinWidth,
}: DataTableProps<R>) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(0);
  const [ownSelected, setOwnSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const selected = selectedProp ?? ownSelected;
  const setSelected = (ids: string[]) => {
    setOwnSelected(ids);
    onSelectedChange?.(ids);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((row) =>
          columns.some((c) =>
            String(row[c.key] ?? "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : data;
    if (!sort) return filtered;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => sign * compare(a[sort.key], b[sort.key]));
  }, [data, columns, query, sort]);

  const pages = Math.max(Math.ceil(rows.length / pageSize), 1);
  const current = Math.min(page, pages - 1);
  const visible = paginated ? rows.slice(current * pageSize, (current + 1) * pageSize) : rows;
  const allOnPage = visible.length > 0 && visible.every((r) => selected.includes(r.id));
  const someOnPage = visible.some((r) => selected.includes(r.id));

  const toggleSort = (key: string) => {
    setSort((s) =>
      s?.key !== key
        ? { key, dir: "desc" }
        : s.dir === "desc"
          ? { key, dir: "asc" }
          : null,
    );
    setPage(0);
  };

  const copyCsv = async () => {
    const lines = [
      columns.map((c) => csvCell(c.label)).join(","),
      ...rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(",")),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <MotionConfig reducedMotion="user">
      <Shell className={cn("max-w-2xl", className)}>
        <ShellHeader
          icon={Table}
          title={title}
          subtitle={
            subtitle ?? (
              <>
                {labels.rowCount(rows.length)}
              </>
            )
          }
          aside={copyable &&
            <IconButton
              icon={copied ? Check : Copy}
              iconWeight={copied ? "bold" : "fill"}
              label={copied ? labels.copied : labels.copy}
              variant="quiet"
              size="sm"
              onClick={copyCsv}
            />
          }
        />
        <Panel className="p-2">
          {searchable && (
            <div className="flex items-center gap-2 p-1 pb-2">
              <SearchField
                className="flex-1"
                placeholder={labels.filter}
                clearLabel={labels.clearSearch}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                onClear={() => setQuery("")}
              />
            </div>
          )}

          <AnimatePresence initial={false}>
            {selectable && selected.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, transition: enter }}
                exit={{ height: 0, opacity: 0, transition: exit }}
                className="overflow-hidden"
              >
                <div className="mx-1 mb-2 flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--tuff-brand,#65aeda)_10%,transparent)] py-1.5 pr-1.5 pl-3 text-[0.8125rem]">
                  <span className="text-[var(--tuff-brand,#65aeda)]">
                    {labels.selectedCount(selected.length)}
                  </span>
                  <Button variant="quiet" size="sm" onClick={() => setSelected([])}>
                    {labels.clear}
                  </Button>
                  <span className="ml-auto flex gap-1.5">{actions?.(selected)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto rounded-[var(--site-card-radius)] focus-visible:outline-2 focus-visible:outline-sky-400" role="region" aria-label={title} tabIndex={0}>
            <table className="w-full border-separate border-spacing-0 text-[0.8125rem]" style={{ minWidth: tableMinWidth }}>
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="text-muted-foreground">
                  {selectable && (
                    <th scope="col" className="w-9 px-2 py-2">
                      <Checkbox
                        aria-label={labels.selectAll}
                        checked={allOnPage ? true : someOnPage ? "mixed" : false}
                        onCheckedChange={() =>
                          setSelected(
                            allOnPage
                              ? selected.filter((id) => !visible.some((r) => r.id === id))
                              : [...new Set([...selected, ...visible.map((r) => r.id)])],
                          )
                        }
                      />
                    </th>
                  )}
                  {columns.map((c, ci) => {
                    const dir = sort?.key === c.key ? sort.dir : null;
                    const SortIcon = dir === "asc" ? CaretUp : CaretDown;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={
                          dir ? (dir === "asc" ? "ascending" : "descending") : undefined
                        }
                        className={cn(
                          "px-2 py-2 font-medium",
                          c.align === "right" ? "text-right" : "text-left",
                          priorityOf(c, ci),
                        )}
                        style={{ width: c.width }}
                      >
                        {c.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(c.key)}
                            className={cn(
                              "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-[background-color,color,scale] duration-150 ease-out hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.97]",
                              dir && "text-foreground",
                              c.align === "right" && "flex-row-reverse",
                            )}
                          >
                            {c.label}
                            <SortIcon
                              weight="bold"
                              aria-hidden="true"
                              className={cn(
                                "size-3 transition-opacity",
                                dir ? "opacity-100" : "opacity-30",
                              )}
                            />
                          </button>
                        ) : (
                          c.label
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => {
                  const isSelected = selected.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "transition-colors duration-150 [&>td:first-child]:rounded-l-[var(--site-card-radius)] [&>td:last-child]:rounded-r-[var(--site-card-radius)]",
                        isSelected
                          ? "bg-[color-mix(in_srgb,var(--tuff-brand,#65aeda)_10%,transparent)]"
                          : i % 2 === 1
                            ? "bg-foreground/[0.025] hover:bg-foreground/[0.05]"
                            : "hover:bg-foreground/[0.05]",
                        onRowClick && "cursor-pointer",
                      )}
                    >
                      {selectable && (
                        <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            aria-label={labels.selectRow(String(row[columns[0].key]))}
                            checked={isSelected}
                            onCheckedChange={(on) =>
                              setSelected(
                                on
                                  ? [...selected, row.id]
                                  : selected.filter((id) => id !== row.id),
                              )
                            }
                          />
                        </td>
                      )}
                      {columns.map((c, ci) => (
                        <td
                          key={c.key}
                          className={cn(
                            "px-2 py-2.5 whitespace-nowrap",
                            priorityOf(c, ci),
                            c.align === "right" &&
                              "text-right font-mono text-xs tabular-nums",
                          )}
                        >
                          {c.format
                            ? c.format(row[c.key], row)
                            : String(row[c.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <EmptyState
                compact
                icon={MagnifyingGlass}
                title={labels.empty}
                description={labels.emptyDescription}
              />
            )}
          </div>
        </Panel>

        {paginated && <footer className="flex items-center justify-between gap-3 py-1.5 pr-1.5 pl-3.5 text-xs text-muted-foreground">
          <span>
            {labels.range(rows.length ? current * pageSize + 1 : 0, Math.min((current + 1) * pageSize, rows.length), rows.length)}
          </span>
          <span className="flex items-center gap-1">
            <IconButton
              icon={CaretLeft}
              iconWeight="bold"
              label={labels.previous}
              variant="quiet"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            />
            <span className="w-14 text-center tabular-nums">
              {current + 1} / {pages}
            </span>
            <IconButton
              icon={CaretRight}
              iconWeight="bold"
              label={labels.next}
              variant="quiet"
              size="sm"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
            />
          </span>
        </footer>}
        <p role="status" aria-live="polite" className="sr-only">
          {copied
            ? labels.copied
            : labels.rowCount(rows.length)}
        </p>
      </Shell>
    </MotionConfig>
  );
}
