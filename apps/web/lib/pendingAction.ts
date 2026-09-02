export type PendingAction =
  | {
      type: "EXPRESS_INTEREST";
      projectId: string;
      unitTypeId?: string | undefined;
      message?: string | undefined;
    }
  | {
      type: "SAVE_PROPERTY";
      projectId: string;
    };

const PENDING_ACTION_KEY = "pendingAction";

export function setPendingAction(action: PendingAction) {
  sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
}

export function consumePendingAction(): PendingAction | null {
  const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
  sessionStorage.removeItem(PENDING_ACTION_KEY);
  return raw ? (JSON.parse(raw) as PendingAction) : null;
}

export function peekPendingAction(): PendingAction | null {
  const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
  return raw ? (JSON.parse(raw) as PendingAction) : null;
}
