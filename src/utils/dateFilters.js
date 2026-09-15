// Date filtering utilities for timeframe selection

export const TIMEFRAMES = {
  LAST_7_DAYS: { key: "7d", label: "Last 7 days", days: 7 },
  LAST_30_DAYS: { key: "30d", label: "Last 30 days", days: 30 },
  LAST_3_MONTHS: { key: "3m", label: "Last 3 months", days: 90 },
  LAST_6_MONTHS: { key: "6m", label: "Last 6 months", days: 180 },
  LAST_YEAR: { key: "1y", label: "Last year", days: 365 },
  ALL_TIME: { key: "all", label: "All time", days: null },
  CUSTOM: { key: "custom", label: "Custom range", days: null },
};

export const TIMEFRAME_OPTIONS = [
  TIMEFRAMES.LAST_7_DAYS,
  TIMEFRAMES.LAST_30_DAYS,
  TIMEFRAMES.LAST_3_MONTHS,
  TIMEFRAMES.LAST_6_MONTHS,
  TIMEFRAMES.LAST_YEAR,
  TIMEFRAMES.ALL_TIME,
  TIMEFRAMES.CUSTOM,
];

// Get date N days ago from today
export function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

// Check if a date string (YYYY-MM-DD) is within the timeframe
export function isWithinTimeframe(dateStr, timeframeKey, customStart, customEnd) {
  if (!dateStr) return false;
  
  const timeframe = TIMEFRAME_OPTIONS.find(tf => tf.key === timeframeKey);
  if (!timeframe) return true;
  
  // All time - include everything
  if (timeframe.key === "all") return true;
  
  // Custom range
  if (timeframe.key === "custom") {
    if (!customStart && !customEnd) return true;
    const date = new Date(dateStr + "T00:00:00");
    if (customStart) {
      const start = new Date(customStart + "T00:00:00");
      if (date < start) return false;
    }
    if (customEnd) {
      const end = new Date(customEnd + "T23:59:59");
      if (date > end) return false;
    }
    return true;
  }
  
  // Relative timeframes (last N days)
  const cutoffDate = getDateDaysAgo(timeframe.days);
  return dateStr >= cutoffDate;
}

// Filter transactions by timeframe
export function filterTransactionsByTimeframe(transactions, timeframeKey, customStart, customEnd) {
  return transactions.filter(t => 
    isWithinTimeframe(t.soldDate, timeframeKey, customStart, customEnd)
  );
}

// Filter units by acquisition date
export function filterUnitsByTimeframe(units, timeframeKey, customStart, customEnd) {
  return units.filter(u => 
    isWithinTimeframe(u.dateAcquired, timeframeKey, customStart, customEnd)
  );
}
