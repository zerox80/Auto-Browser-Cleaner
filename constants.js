"use strict";

// Global constants shared across extension scripts
// Default interval for automatic cleaning (4 days) — used when no user setting exists
const DEFAULT_INTERVAL_DAYS = 4;
const DEFAULT_INTERVAL_MINUTES = DEFAULT_INTERVAL_DAYS * 24 * 60;
const FOUR_DAYS_MS = DEFAULT_INTERVAL_DAYS * 24 * 60 * 60 * 1000; // backward-compat usage

// Shared alarm name for scheduling periodic cleanups
const ALARM_NAME = 'autoClean';

// Shared storage keys
const STORAGE_KEYS = Object.freeze({
  intervalMinutes: 'intervalMinutes',
  lastCleanTime: 'lastCleanTime',
  cleanCount: 'cleanCount'
});
