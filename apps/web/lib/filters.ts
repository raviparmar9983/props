/**
 * Expands UI-level bucket values into the discrete values the search API
 * understands. "4+" is a single button in the BHK picker but the backend
 * only matches exact bedroom counts (with anything >= 4 needing to be
 * enumerated), so it must be expanded before being sent as a query param.
 */
export function expandBedroomValues(values: string[]): string[] {
  const out = new Set<string>();
  for (const v of values) {
    if (v === "4+") {
      out.add("4");
      out.add("5");
      out.add("6");
    } else {
      out.add(v);
    }
  }
  return [...out];
}
