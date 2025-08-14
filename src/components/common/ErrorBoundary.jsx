import React from "react";
import { Button } from "../ui/index.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // For now, just log to console
    console.error("Error Report:", errorReport);

    // You could also store in localStorage for later reporting
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem("error_reports") || "[]"
      );
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem("error_reports", JSON.stringify(recentErrors));
    } catch (e) {
      console.error("Failed to store error report:", e);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReportIssue = () => {
    const errorDetails = {
      message: this.state.error?.message || "Unknown error",
      stack: this.state.error?.stack || "No stack trace",
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    };

    // Create mailto link with error details
    const subject = encodeURIComponent("Gorgeous Notes - Error Report");
    const body = encodeURIComponent(`
Error ID: ${errorDetails.errorId}
Time: ${errorDetails.timestamp}
Message: ${errorDetails.message}

Please describe what you were doing when this error occurred:
[Your description here]

Technical Details:
${errorDetails.stack}
    `);

    window.open(
      `mailto:support@gorgeousnotes.com?subject=${subject}&body=${body}`
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
          <div className="max-w-md w-full text-center">
            <div className="p-8 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/10">
              {/* Error Icon */}
              <div className="text-6xl mb-6">💥</div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-white/70 mb-6">
                We're sorry, but something unexpected happened. Don't worry,
                your notes are safe and this error has been logged.
              </p>

              {/* Error ID */}
              {this.state.errorId && (
                <div className="mb-6 p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Error ID:</p>
                  <code className="text-white text-sm font-mono">
                    {this.state.errorId}
                  </code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>

                <Button
                  variant="secondary"
                  size="large"
                  fullWidth
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>

                <Button
                  variant="outline"
                  size="medium"
                  fullWidth
                  onClick={this.handleReportIssue}
                >
                  Report Issue
                </Button>
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-white/60 cursor-pointer hover:text-white">
                    Error Details (Development)
                  </summary>
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <pre className="text-red-400 text-xs overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
