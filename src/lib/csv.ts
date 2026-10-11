/**
 * Client-side CSV export (idea bag #6 — real action, no backend route).
 * Joins `header` + `rows` verbatim and triggers a download. Cells are not
 * escaped here — quote/escape at the call site when values may contain
 * commas or quotes (see the cohorts export).
 */
export function downloadCsvFile(
  filename: string,
  header: string[],
  rows: (string | number)[][],
) {
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
