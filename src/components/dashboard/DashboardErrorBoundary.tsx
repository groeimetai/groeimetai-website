'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface DashboardErrorFallbackProps {
  error: Error;
  reset: () => void;
  componentName?: string;
}

// Fallback component for dashboard errors with dark theme styling
export function DashboardErrorFallback({ error, reset, componentName }: DashboardErrorFallbackProps) {
  return (
    <Card className="bg-red-500/10 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {componentName ? `Error in ${componentName}` : 'Something went wrong'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-300 text-sm mb-4">
          {error.message || 'An unexpected error occurred while loading this section.'}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  componentName?: string;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('DashboardErrorBoundary caught an error:', error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} reset={this.resetError} />;
      }

      return (
        <DashboardErrorFallback
          error={this.state.error}
          reset={this.resetError}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withDashboardErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <DashboardErrorBoundary componentName={displayName}>
      <WrappedComponent {...props} />
    </DashboardErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withDashboardErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default DashboardErrorBoundary;
