import type { RunStreamFixtureEvent } from "./listenModeElementList";

export const parseRunStreamFixture = (
  rawText: string
): RunStreamFixtureEvent[] =>
  rawText
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6).trim())
    .flatMap((payload) => {
      if (!payload) {
        return [];
      }

      try {
        return [JSON.parse(payload) as RunStreamFixtureEvent];
      } catch {
        return [];
      }
    });
