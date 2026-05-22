/**
 * Agent Response Time Extension
 *
 * Tracks LLM response times per turn and cumulatively per session.
 * Displays timing information in the status bar footer:
 *   - Current turn time (green)
 *   - Cumulative session time (accent color)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let cumulativeMs = 0;
  let promptStartMs = 0;

  pi.on("session_start", async () => {
    cumulativeMs = 0;
  });

  pi.on("agent_start", async (_event, ctx) => {
    promptStartMs = Date.now();
  });

  pi.on("agent_end", async (_event, ctx) => {
    const elapsed = Date.now() - promptStartMs;
    cumulativeMs += elapsed;

    if (cumulativeMs === 0) {
      ctx.ui.setStatus("response-time", undefined);
    } else {
      const theme = ctx.ui.theme;
      const current = formatMs(elapsed);
      const total = formatMs(cumulativeMs);
      ctx.ui.setStatus("response-time", "⏱ " + theme.fg("success", current) + "  ┃  " + theme.fg("accent", total));
    }
  });

  function formatMs(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) {
      const remainingSeconds = totalSeconds % 60;
      return `${totalMinutes}m ${remainingSeconds}s`;
    }
    const totalHours = Math.floor(totalMinutes / 60);
    if (totalHours < 24) {
      const remainingMinutes = totalMinutes % 60;
      return `${totalHours}h ${remainingMinutes}m`;
    }
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    return `${totalDays}d ${remainingHours}h`;
  }
}
