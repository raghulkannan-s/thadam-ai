"use client";

import React from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center p-20 w-full min-h-[50vh]">
          <ErrorState 
            title="UI Render Error" 
            message={this.state.error?.message || "An unexpected error crashed this component."} 
            onRetry={() => this.setState({ hasError: false, error: null })} 
          />
        </div>
      );
    }

    return this.props.children;
  }
}
