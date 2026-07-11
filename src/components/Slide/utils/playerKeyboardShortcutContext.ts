import { createContext } from "react";

export interface PlayerKeyboardShortcutContextValue {
  enabled: boolean;
  ownerId: string;
}

export const PlayerKeyboardShortcutContext =
  createContext<PlayerKeyboardShortcutContextValue | null>(null);
