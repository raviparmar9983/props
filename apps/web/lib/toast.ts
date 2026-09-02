export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(items);
}

function push(type: ToastType, message: string, title?: string) {
  if (items.some((i) => i.type === type && i.message === message)) return;
  const item: ToastItem = { id: nextId++, type, message };
  if (title) item.title = title;
  items = [...items, item];
  emit();
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismiss(item.id), 4500);
  }
}

export function dismiss(id: number) {
  items = items.filter((i) => i.id !== id);
  emit();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const toast = {
  success: (message: string, title?: string) => push("success", message, title),
  error: (message: string, title?: string) => push("error", message, title),
  info: (message: string, title?: string) => push("info", message, title),
};
