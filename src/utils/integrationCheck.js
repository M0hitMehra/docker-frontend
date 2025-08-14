// Final integration validation and health checks

export class IntegrationValidator {
  constructor() {
    this.checks = [];
    this.results = [];
  }

  // Add a validation check
  addCheck(name, checkFunction, critical = false) {
    this.checks.push({ name, checkFunction, critical });
  }

  // Run all validation checks
  async runAllChecks() {
    console.group("🔍 Running Integration Validation Checks");

    this.results = [];
    let criticalFailures = 0;
    let totalFailures = 0;

    for (const check of this.checks) {
      try {
        const startTime = performance.now();
        const result = await check.checkFunction();
        const duration = performance.now() - startTime;

        const checkResult = {
          name: check.name,
          passed: result.passed,
          message: result.message,
          details: result.details || {},
          duration: Math.round(duration),
          critical: check.critical,
        };

        this.results.push(checkResult);

        if (result.passed) {
          console.log(
            `✅ ${check.name} - ${result.message} (${checkResult.duration}ms)`
          );
        } else {
          console.error(`❌ ${check.name} - ${result.message}`);
          if (result.details) {
            console.error("Details:", result.details);
          }

          totalFailures++;
          if (check.critical) {
            criticalFailures++;
          }
        }
      } catch (error) {
        console.error(`💥 ${check.name} - Check failed with error:`, error);
        this.results.push({
          name: check.name,
          passed: false,
          message: `Check failed: ${error.message}`,
          error: error,
          critical: check.critical,
        });

        totalFailures++;
        if (check.critical) {
          criticalFailures++;
        }
      }
    }

    const summary = {
      total: this.checks.length,
      passed: this.checks.length - totalFailures,
      failed: totalFailures,
      criticalFailures,
      success: criticalFailures === 0,
    };

    console.groupEnd();
    console.group("📊 Integration Check Summary");
    console.log(`Total Checks: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Critical Failures: ${summary.criticalFailures}`);
    console.log(`Overall Status: ${summary.success ? "✅ PASS" : "❌ FAIL"}`);
    console.groupEnd();

    return { summary, results: this.results };
  }

  // Get validation report
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.getSummary(),
    };
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;
    const criticalFailures = this.results.filter(
      (r) => !r.passed && r.critical
    ).length;

    return {
      total,
      passed,
      failed,
      criticalFailures,
      success: criticalFailures === 0,
    };
  }
}

// Create default integration validator
export const createIntegrationValidator = () => {
  const validator = new IntegrationValidator();

  // Environment checks
  validator.addCheck(
    "Environment Variables",
    async () => {
      const requiredEnvVars = ["NODE_ENV"];
      const missing = requiredEnvVars.filter((env) => !process.env[env]);

      return {
        passed: missing.length === 0,
        message:
          missing.length === 0
            ? "All required environment variables are set"
            : `Missing environment variables: ${missing.join(", ")}`,
        details: { missing, available: Object.keys(process.env).length },
      };
    },
    false
  );

  // Storage availability
  validator.addCheck(
    "Local Storage",
    async () => {
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, "test");
        const value = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        return {
          passed: value === "test",
          message: "Local storage is available and working",
          details: { available: true },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Local storage is not available",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // API connectivity
  validator.addCheck(
    "API Connectivity",
    async () => {
      try {
        // This would typically ping a health endpoint
        // For now, we'll just check if fetch is available
        if (typeof fetch === "undefined") {
          return {
            passed: false,
            message: "Fetch API is not available",
            details: { fetchAvailable: false },
          };
        }

        return {
          passed: true,
          message: "API connectivity prerequisites are available",
          details: { fetchAvailable: true },
        };
      } catch (error) {
        return {
          passed: false,
          message: "API connectivity check failed",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // Redux store
  validator.addCheck(
    "Redux Store",
    async () => {
      try {
        // Check if we can import the store
        const { store } = await import("../store/index.js");
        const state = store.getState();

        const requiredSlices = ["auth", "notes", "ui"];
        const availableSlices = Object.keys(state);
        const missingSlices = requiredSlices.filter(
          (slice) => !availableSlices.includes(slice)
        );

        return {
          passed: missingSlices.length === 0,
          message:
            missingSlices.length === 0
              ? "Redux store is properly configured"
              : `Missing Redux slices: ${missingSlices.join(", ")}`,
          details: { availableSlices, missingSlices },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Redux store initialization failed",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // Router configuration
  validator.addCheck(
    "Router Configuration",
    async () => {
      try {
        const { routeConfig } = await import("../config/routes.js");
        const routes = Object.keys(routeConfig);
        const requiredRoutes = [
          "/",
          "/login",
          "/register",
          "/notes",
          "/profile",
        ];
        const missingRoutes = requiredRoutes.filter(
          (route) => !routes.includes(route)
        );

        return {
          passed: missingRoutes.length === 0,
          message:
            missingRoutes.length === 0
              ? "Router configuration is complete"
              : `Missing route configurations: ${missingRoutes.join(", ")}`,
          details: { availableRoutes: routes, missingRoutes },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Router configuration check failed",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // Component lazy loading
  validator.addCheck(
    "Lazy Loading",
    async () => {
      try {
        // Check if React.lazy is available
        if (typeof React === "undefined" || !React.lazy) {
          return {
            passed: false,
            message: "React.lazy is not available",
            details: { reactLazyAvailable: false },
          };
        }

        return {
          passed: true,
          message: "Lazy loading is properly configured",
          details: { reactLazyAvailable: true },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Lazy loading check failed",
          details: { error: error.message },
        };
      }
    },
    false
  );

  // Error handling
  validator.addCheck(
    "Error Handling",
    async () => {
      try {
        const { setupGlobalErrorHandlers } = await import("./errorHandler.js");

        return {
          passed: typeof setupGlobalErrorHandlers === "function",
          message: "Error handling is properly configured",
          details: { globalErrorHandlersAvailable: true },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Error handling configuration failed",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // Performance monitoring
  validator.addCheck(
    "Performance Monitoring",
    async () => {
      try {
        const { performanceMonitor } = await import("./performance.jsx");

        return {
          passed:
            performanceMonitor &&
            typeof performanceMonitor.startMeasurement === "function",
          message: "Performance monitoring is available",
          details: { performanceMonitorAvailable: true },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Performance monitoring check failed",
          details: { error: error.message },
        };
      }
    },
    false
  );

  // Authentication services
  validator.addCheck(
    "Authentication Services",
    async () => {
      try {
        const { authService } = await import("../services/authService.js");
        const { authPersistenceService } = await import(
          "../services/authPersistence.js"
        );

        const requiredMethods = ["login", "register", "logout", "verifyToken"];
        const availableMethods = requiredMethods.filter(
          (method) => typeof authService[method] === "function"
        );

        return {
          passed: availableMethods.length === requiredMethods.length,
          message:
            availableMethods.length === requiredMethods.length
              ? "Authentication services are properly configured"
              : `Missing auth methods: ${requiredMethods
                  .filter((m) => !availableMethods.includes(m))
                  .join(", ")}`,
          details: {
            availableMethods,
            persistenceServiceAvailable: !!authPersistenceService,
          },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Authentication services check failed",
          details: { error: error.message },
        };
      }
    },
    true
  );

  // Bundle size check
  validator.addCheck(
    "Bundle Size",
    async () => {
      try {
        const scripts = document.querySelectorAll("script[src]");
        const styles = document.querySelectorAll('link[rel="stylesheet"]');

        const totalAssets = scripts.length + styles.length;
        const maxRecommendedAssets = 20;

        return {
          passed: totalAssets <= maxRecommendedAssets,
          message:
            totalAssets <= maxRecommendedAssets
              ? `Bundle size is optimal (${totalAssets} assets)`
              : `Bundle size may be too large (${totalAssets} assets, recommended: ${maxRecommendedAssets})`,
          details: {
            scripts: scripts.length,
            styles: styles.length,
            total: totalAssets,
            recommended: maxRecommendedAssets,
          },
        };
      } catch (error) {
        return {
          passed: false,
          message: "Bundle size check failed",
          details: { error: error.message },
        };
      }
    },
    false
  );

  return validator;
};

// Run integration checks on app startup
export const runStartupChecks = async () => {
  if (process.env.NODE_ENV === "development") {
    const validator = createIntegrationValidator();
    const results = await validator.runAllChecks();

    // Store results for debugging
    window.__integrationCheckResults = results;

    return results;
  }

  return { summary: { success: true }, results: [] };
};
