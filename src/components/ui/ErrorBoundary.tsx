'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for graceful error handling
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    window.location.href = '/overview';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className={cn(
            'tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-[400px]',
            'tw-bg-obsidian-800 tw-rounded-lg tw-p-8 tw-text-center',
            this.props.className
          )}
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle
            className="tw-w-16 tw-h-16 tw-text-status-critical tw-mb-4"
            aria-hidden="true"
          />
          <h2 className="tw-text-subtitle tw-font-semibold tw-text-obsidian-100 tw-mb-2">
            Something went wrong
          </h2>
          <p className="tw-text-body tw-text-obsidian-400 tw-mb-6 tw-max-w-md">
            We encountered an unexpected error. Please try again or return to the
            dashboard.
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="tw-mb-6 tw-text-left tw-w-full tw-max-w-md">
              <summary className="tw-text-caption tw-text-obsidian-500 tw-cursor-pointer hover:tw-text-obsidian-300">
                Error details (development only)
              </summary>
              <pre className="tw-mt-2 tw-p-3 tw-bg-obsidian-900 tw-rounded tw-text-caption tw-text-status-critical tw-overflow-auto tw-max-h-40">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="tw-flex tw-gap-3">
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="tw-w-4 tw-h-4" />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              leftIcon={<Home className="tw-w-4 tw-h-4" />}
              onClick={this.handleGoHome}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level error boundary with full-page styling
 */
export class PageErrorBoundary extends ErrorBoundary {
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-obsidian-900 tw-p-4">
          <div
            className={cn(
              'tw-flex tw-flex-col tw-items-center tw-justify-center',
              'tw-bg-obsidian-800 tw-rounded-lg tw-p-8 tw-text-center tw-max-w-lg tw-w-full'
            )}
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle
              className="tw-w-20 tw-h-20 tw-text-status-critical tw-mb-6"
              aria-hidden="true"
            />
            <h1 className="tw-text-title tw-font-semibold tw-text-obsidian-100 tw-mb-3">
              Oops! Something went wrong
            </h1>
            <p className="tw-text-body tw-text-obsidian-400 tw-mb-8">
              We&apos;re sorry, but something unexpected happened. Please try refreshing
              the page or return to the dashboard.
            </p>

            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full sm:tw-w-auto">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<RefreshCw className="tw-w-5 tw-h-5" />}
                onClick={() => window.location.reload()}
                className="tw-w-full sm:tw-w-auto"
              >
                Refresh Page
              </Button>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Home className="tw-w-5 tw-h-5" />}
                onClick={() => (window.location.href = '/overview')}
                className="tw-w-full sm:tw-w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
