// Final optimizations and cleanup utilities

// Bundle analyzer for development
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== "development") return;

  const scripts = Array.from(document.querySelectorAll("script[src]"));
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  );

  const analysis = {
    scripts: scripts.map((script) => ({
      src: script.src,
      async: script.async,
      defer: script.defer,
      type: script.type || "text/javascript",
    })),
    styles: styles.map((style) => ({
      href: style.href,
      media: style.media || "all",
    })),
    summary: {
      totalScripts: scripts.length,
      totalStyles: styles.length,
      asyncScripts: scripts.filter((s) => s.async).length,
      deferredScripts: scripts.filter((s) => s.defer).length,
    },
  };

  console.group("📦 Bundle Analysis");
  console.table(analysis.summary);
  console.log("Scripts:", analysis.scripts);
  console.log("Styles:", analysis.styles);
  console.groupEnd();

  return analysis;
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof performance === "undefined" || !performance.memory) {
    console.warn("Memory monitoring not available in this browser");
    return null;
  }

  const memory = performance.memory;
  const usage = {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    percentage: Math.round(
      (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    ),
  };

  if (usage.percentage > 80) {
    console.warn(
      `⚠️ High memory usage: ${usage.percentage}% (${usage.used}MB/${usage.limit}MB)`
    );
  } else {
    console.log(
      `💾 Memory usage: ${usage.percentage}% (${usage.used}MB/${usage.limit}MB)`
    );
  }

  return usage;
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  const metrics = {};

  // Navigation timing
  if (performance.timing) {
    const timing = performance.timing;
    metrics.navigation = {
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstByte: timing.responseStart - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
    };
  }

  // Paint timing
  if (performance.getEntriesByType) {
    const paintEntries = performance.getEntriesByType("paint");
    metrics.paint = {};
    paintEntries.forEach((entry) => {
      metrics.paint[entry.name.replace("-", "")] = Math.round(entry.startTime);
    });
  }

  // Resource timing
  if (performance.getEntriesByType) {
    const resourceEntries = performance.getEntriesByType("resource");
    metrics.resources = {
      total: resourceEntries.length,
      scripts: resourceEntries.filter((r) => r.name.includes(".js")).length,
      styles: resourceEntries.filter((r) => r.name.includes(".css")).length,
      images: resourceEntries.filter((r) =>
        /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)
      ).length,
      fonts: resourceEntries.filter((r) =>
        /\.(woff|woff2|ttf|otf)/.test(r.name)
      ).length,
    };
  }

  // Memory usage
  const memoryUsage = monitorMemoryUsage();
  if (memoryUsage) {
    metrics.memory = memoryUsage;
  }

  return metrics;
};

// Accessibility audit
export const runAccessibilityAudit = () => {
  const issues = [];

  // Check for missing alt attributes
  const images = document.querySelectorAll("img:not([alt])");
  if (images.length > 0) {
    issues.push({
      type: "missing-alt",
      severity: "error",
      count: images.length,
      message: `${images.length} images missing alt attributes`,
    });
  }

  // Check for missing form labels
  const inputs = document.querySelectorAll(
    "input:not([aria-label]):not([aria-labelledby])"
  );
  const unlabeledInputs = Array.from(inputs).filter((input) => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    return !label && input.type !== "hidden" && input.type !== "submit";
  });

  if (unlabeledInputs.length > 0) {
    issues.push({
      type: "missing-labels",
      severity: "error",
      count: unlabeledInputs.length,
      message: `${unlabeledInputs.length} form inputs missing labels`,
    });
  }

  // Check for missing heading hierarchy
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  if (headings.length === 0) {
    issues.push({
      type: "no-headings",
      severity: "warning",
      message: "No heading elements found",
    });
  }

  // Check for missing focus indicators
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // This is a simplified check - in reality you'd need to test actual focus styles
  const elementsWithoutFocusStyles = Array.from(focusableElements).filter(
    (el) => {
      const styles = getComputedStyle(el);
      return !styles.outline && !styles.boxShadow;
    }
  );

  if (elementsWithoutFocusStyles.length > 0) {
    issues.push({
      type: "missing-focus-indicators",
      severity: "warning",
      count: elementsWithoutFocusStyles.length,
      message: `${elementsWithoutFocusStyles.length} focusable elements may be missing focus indicators`,
    });
  }

  // Check color contrast (simplified)
  const textElements = document.querySelectorAll(
    "p, span, div, h1, h2, h3, h4, h5, h6, a, button"
  );
  let lowContrastElements = 0;

  Array.from(textElements).forEach((el) => {
    const styles = getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // This is a very simplified contrast check
    // In reality, you'd need a proper contrast ratio calculation
    if (color === backgroundColor) {
      lowContrastElements++;
    }
  });

  if (lowContrastElements > 0) {
    issues.push({
      type: "low-contrast",
      severity: "warning",
      count: lowContrastElements,
      message: `${lowContrastElements} elements may have low color contrast`,
    });
  }

  const audit = {
    timestamp: new Date().toISOString(),
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
    },
  };

  if (issues.length > 0) {
    console.group("♿ Accessibility Audit Results");
    console.warn(`Found ${audit.summary.total} accessibility issues:`);
    issues.forEach((issue) => {
      const icon = issue.severity === "error" ? "❌" : "⚠️";
      console.log(`${icon} ${issue.message}`);
    });
    console.groupEnd();
  } else {
    console.log("♿ Accessibility audit: No issues found");
  }

  return audit;
};

// SEO audit
export const runSEOAudit = () => {
  const issues = [];

  // Check for title tag
  const title = document.querySelector("title");
  if (!title || !title.textContent.trim()) {
    issues.push({
      type: "missing-title",
      severity: "error",
      message: "Missing or empty title tag",
    });
  } else if (title.textContent.length > 60) {
    issues.push({
      type: "long-title",
      severity: "warning",
      message: `Title tag is too long (${title.textContent.length} characters, recommended: <60)`,
    });
  }

  // Check for meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription || !metaDescription.content.trim()) {
    issues.push({
      type: "missing-meta-description",
      severity: "error",
      message: "Missing or empty meta description",
    });
  } else if (metaDescription.content.length > 160) {
    issues.push({
      type: "long-meta-description",
      severity: "warning",
      message: `Meta description is too long (${metaDescription.content.length} characters, recommended: <160)`,
    });
  }

  // Check for viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    issues.push({
      type: "missing-viewport",
      severity: "error",
      message: "Missing viewport meta tag",
    });
  }

  // Check for canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    issues.push({
      type: "missing-canonical",
      severity: "warning",
      message: "Missing canonical URL",
    });
  }

  // Check for Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector(
    'meta[property="og:description"]'
  );
  const ogImage = document.querySelector('meta[property="og:image"]');

  if (!ogTitle || !ogDescription || !ogImage) {
    issues.push({
      type: "incomplete-og-tags",
      severity: "warning",
      message:
        "Incomplete Open Graph tags (missing title, description, or image)",
    });
  }

  const audit = {
    timestamp: new Date().toISOString(),
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
    },
  };

  if (issues.length > 0) {
    console.group("🔍 SEO Audit Results");
    console.warn(`Found ${audit.summary.total} SEO issues:`);
    issues.forEach((issue) => {
      const icon = issue.severity === "error" ? "❌" : "⚠️";
      console.log(`${icon} ${issue.message}`);
    });
    console.groupEnd();
  } else {
    console.log("🔍 SEO audit: No issues found");
  }

  return audit;
};

// Comprehensive app health check
export const runHealthCheck = () => {
  console.group("🏥 Application Health Check");

  const results = {
    timestamp: new Date().toISOString(),
    performance: collectPerformanceMetrics(),
    bundle: analyzeBundleSize(),
    accessibility: runAccessibilityAudit(),
    seo: runSEOAudit(),
    memory: monitorMemoryUsage(),
  };

  // Overall health score
  const totalIssues =
    results.accessibility.summary.total + results.seo.summary.total;
  const criticalIssues =
    results.accessibility.summary.errors + results.seo.summary.errors;

  let healthScore = 100;
  healthScore -= criticalIssues * 10; // -10 points per critical issue
  healthScore -= (totalIssues - criticalIssues) * 5; // -5 points per warning

  if (results.memory && results.memory.percentage > 80) {
    healthScore -= 15; // High memory usage penalty
  }

  if (
    results.performance.navigation &&
    results.performance.navigation.pageLoad > 3000
  ) {
    healthScore -= 10; // Slow page load penalty
  }

  results.healthScore = Math.max(0, healthScore);
  results.status =
    healthScore >= 80
      ? "excellent"
      : healthScore >= 60
      ? "good"
      : healthScore >= 40
      ? "fair"
      : "poor";

  console.log(
    `Overall Health Score: ${
      results.healthScore
    }/100 (${results.status.toUpperCase()})`
  );
  console.groupEnd();

  // Store results globally for debugging
  window.__appHealthCheck = results;

  return results;
};

// Initialize final optimizations
export const initializeFinalOptimizations = () => {
  if (process.env.NODE_ENV === "development") {
    // Run health check after a delay to allow app to fully load
    setTimeout(() => {
      runHealthCheck();
    }, 3000);

    // Set up periodic memory monitoring
    setInterval(() => {
      const usage = monitorMemoryUsage();
      if (usage && usage.percentage > 90) {
        console.warn("🚨 Critical memory usage detected! Consider optimizing.");
      }
    }, 30000); // Check every 30 seconds
  }
};
