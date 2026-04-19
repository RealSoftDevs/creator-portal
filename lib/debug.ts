// Debug configuration - Set to false in production to disable all console logs
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

export const debug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.info(...args);
    }
  },
  group: (label: string, fn: () => void) => {
    if (DEBUG_MODE) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
  table: (data: any) => {
    if (DEBUG_MODE) {
      console.table(data);
    }
  },
  time: (label: string) => {
    if (DEBUG_MODE) {
      console.time(label);
    }
  },
  timeEnd: (label: string) => {
    if (DEBUG_MODE) {
      console.timeEnd(label);
    }
  }
};

// Performance monitoring
export const perf = {
  mark: (name: string) => {
    if (DEBUG_MODE && typeof performance !== 'undefined') {
      performance.mark(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (DEBUG_MODE && typeof performance !== 'undefined') {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      debug.log(`⏱️ ${name}: ${entries[0]?.duration.toFixed(2)}ms`);
    }
  }
};