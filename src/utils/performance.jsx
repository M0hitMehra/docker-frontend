// Performance monitoring and optimization utilities

// Performance measurement
export class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.observers = new Map();
  }

  // Start measuring performance
  startMeasurement(name) {
    if (typeof performance !== "undefined" && performance.mark) {
      performance.mark(`${name}-start`);
    }
    this.measurements.set(name, { startTime: Date.now() });
  }

  // End measurement and get duration
  endMeasurement(name) {
    const measurement = this.measurements.get(name);
    if (!measurement) return null;

    const endTime = Date.now();
    const duration = endTime - measurement.startTime;

    if (
      typeof performance !== "undefined" &&
      performance.mark &&
      performance.measure
    ) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    this.measurements.set(name, {
      ...measurement,
      endTime,
      duration,
    });

    return duration;
  }

  // Get measurement result
  getMeasurement(name) {
    return this.measurements.get(name);
  }

  // Get all measurements
  getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }

  // Clear measurements
  clearMeasurements() {
    this.measurements.clear();
    if (typeof performance !== "undefined" && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // Observe performance entries
  observePerformance(callback) {
    if (typeof PerformanceObserver !== "undefined") {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        callback(entries);
      });

      observer.observe({ entryTypes: ["measure", "navigation", "paint"] });
      return observer;
    }
    return null;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React component performance wrapper
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.startMeasurement(`${componentName}-render`);
      return () => {
        const duration = performanceMonitor.endMeasurement(
          `${componentName}-render`
        );
        if (duration > 100) {
          // Log slow renders
          console.warn(
            `Slow render detected: ${componentName} took ${duration}ms`
          );
        }
      };
    });

    return <WrappedComponent {...props} ref={ref} />;
  });
};

// Debounce utility for performance
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  if (typeof IntersectionObserver !== "undefined") {
    return new IntersectionObserver(callback, defaultOptions);
  }
  return null;
};

// Virtual scrolling utility
export class VirtualScroller {
  constructor(container, itemHeight, buffer = 5) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
    this.scrollTop = 0;
    this.containerHeight = 0;
    this.totalItems = 0;
  }

  calculateVisibleRange(totalItems) {
    this.totalItems = totalItems;
    this.containerHeight = this.container.clientHeight;
    this.scrollTop = this.container.scrollTop;

    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight),
      totalItems - 1
    );

    return {
      startIndex: Math.max(0, startIndex - this.buffer),
      endIndex: Math.min(totalItems - 1, endIndex + this.buffer),
      offsetY: Math.max(0, (startIndex - this.buffer) * this.itemHeight),
    };
  }

  getTotalHeight() {
    return this.totalItems * this.itemHeight;
  }
}

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof performance !== "undefined" && performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.querySelectorAll("script[src]"));
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  );

  return {
    scripts: scripts.length,
    styles: styles.length,
    totalAssets: scripts.length + styles.length,
  };
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  const metrics = {};

  // Navigation timing (using modern API)
  if (typeof performance !== "undefined") {
    try {
      // Try modern Navigation Timing API first
      if (performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          const nav = navEntries[0];
          metrics.pageLoad = nav.loadEventEnd - nav.fetchStart;
          metrics.domReady = nav.domContentLoadedEventEnd - nav.fetchStart;
          metrics.firstPaint = nav.responseStart - nav.fetchStart;
        }
      }
      // Fallback to deprecated API if modern one isn't available
      else if (performance.timing) {
        const timing = performance.timing;
        metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
        metrics.domReady =
          timing.domContentLoadedEventEnd - timing.navigationStart;
        metrics.firstPaint = timing.responseStart - timing.navigationStart;
      }
    } catch (error) {
      console.warn("Performance timing measurement failed:", error);
    }
  }

  // Paint timing
  if (typeof performance !== "undefined" && performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach((entry) => {
      metrics[entry.name] = entry.startTime;
    });
  }

  // Memory usage
  const memory = getMemoryUsage();
  if (memory) {
    metrics.memoryUsage = memory;
  }

  // Bundle analysis
  metrics.bundleInfo = analyzeBundleSize();

  return metrics;
};

// Performance optimization recommendations
export const getPerformanceRecommendations = (metrics) => {
  const recommendations = [];

  if (metrics.pageLoad > 3000) {
    recommendations.push({
      type: "warning",
      message:
        "Page load time is over 3 seconds. Consider code splitting and lazy loading.",
      metric: "pageLoad",
      value: metrics.pageLoad,
    });
  }

  if (metrics.memoryUsage && metrics.memoryUsage.used > 50) {
    recommendations.push({
      type: "warning",
      message: "High memory usage detected. Check for memory leaks.",
      metric: "memoryUsage",
      value: metrics.memoryUsage.used,
    });
  }

  if (metrics.bundleInfo.scripts > 10) {
    recommendations.push({
      type: "info",
      message: "Many script files detected. Consider bundling optimization.",
      metric: "scriptCount",
      value: metrics.bundleInfo.scripts,
    });
  }

  return recommendations;
};

// React performance hooks
export const usePerformanceMonitoring = (componentName) => {
  React.useEffect(() => {
    performanceMonitor.startMeasurement(`${componentName}-mount`);

    return () => {
      performanceMonitor.endMeasurement(`${componentName}-mount`);
    };
  }, [componentName]);

  const measureRender = React.useCallback(() => {
    performanceMonitor.startMeasurement(`${componentName}-render`);

    return () => {
      performanceMonitor.endMeasurement(`${componentName}-render`);
    };
  }, [componentName]);

  return { measureRender };
};

// Lazy loading hook
export const useLazyLoading = (ref, callback, options = {}) => {
  React.useEffect(() => {
    const observer = createIntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          observer?.unobserve(entry.target);
        }
      });
    }, options);

    if (observer && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer && ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback, options]);
};

// Development performance logger
export const logPerformanceMetrics = () => {
  if (process.env.NODE_ENV === "development") {
    const metrics = collectPerformanceMetrics();
    const recommendations = getPerformanceRecommendations(metrics);

    console.group("🚀 Performance Metrics");
    console.table(metrics);

    if (recommendations.length > 0) {
      console.group("💡 Recommendations");
      recommendations.forEach((rec) => {
        // Use proper console methods
        if (rec.type === "warning") {
          console.warn(rec.message, rec.value);
        } else if (rec.type === "error") {
          console.error(rec.message, rec.value);
        } else {
          console.info(rec.message, rec.value);
        }
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
};
