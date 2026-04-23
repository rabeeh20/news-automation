// ─── Cron Scheduler ──────────────────────────────────
// Scheduling utilities for the news pipeline.
// The actual cron worker runs as a separate PM2 process
// (src/workers/news-cron.ts). This module provides
// scheduling helpers for use in the admin API.

import { CRON_START_HOUR, CRON_END_HOUR, CRON_INTERVAL_MINUTES } from "./constants";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [Scheduler] ${message}`);
}

/**
 * Get the current IST time.
 */
export function getISTTime(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
}

/**
 * Check if the cron worker should be active right now.
 */
export function isWithinOperatingHours(): boolean {
  const istTime = getISTTime();
  const hour = istTime.getHours();
  return hour >= CRON_START_HOUR && hour < CRON_END_HOUR;
}

/**
 * Get the next scheduled run time in IST.
 */
export function getNextRunTime(): Date {
  const istNow = getISTTime();
  const minutes = istNow.getMinutes();
  const nextInterval = Math.ceil(minutes / CRON_INTERVAL_MINUTES) * CRON_INTERVAL_MINUTES;
  const nextRun = new Date(istNow);
  nextRun.setMinutes(nextInterval, 0, 0);

  // If next run is in the past or now, add one interval
  if (nextRun <= istNow) {
    nextRun.setMinutes(nextRun.getMinutes() + CRON_INTERVAL_MINUTES);
  }

  // If outside operating hours, set to next day's start
  if (nextRun.getHours() >= CRON_END_HOUR) {
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(CRON_START_HOUR, 0, 0, 0);
  }

  return nextRun;
}

/**
 * Get scheduler status info for the admin dashboard.
 */
export function getSchedulerStatus() {
  const isActive = isWithinOperatingHours();
  const nextRun = getNextRunTime();
  const istNow = getISTTime();

  log(`Status check: active=${isActive}, IST=${istNow.toLocaleTimeString()}`);

  return {
    isActive,
    currentTimeIST: istNow.toISOString(),
    nextRunIST: nextRun.toISOString(),
    schedule: `Every ${CRON_INTERVAL_MINUTES} min, ${CRON_START_HOUR}:00–${CRON_END_HOUR}:00 IST`,
    operatingHours: { start: CRON_START_HOUR, end: CRON_END_HOUR },
    intervalMinutes: CRON_INTERVAL_MINUTES,
  };
}
