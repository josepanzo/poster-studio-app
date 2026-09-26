import React from 'react';
import { STORAGE_KEY } from '../state/poster-state';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level error boundary. If rendering fails (e.g. corrupt persisted state
 * slipping through normalization), show a recoverable screen instead of a
 * blank page. Offers a "Reset studio" action that clears localStorage state.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Poster Studio crashed:', error, info.componentStack);
  }

  handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore — best effort cleanup
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex h-screen w-screen flex-col items-center justify-center gap-4 p-8"
          style={{ background: '#0c0c14', color: '#ffffff' }}
          role="alert"
        >
          <h1
            className="text-[20px]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-[14px]" style={{ color: '#9090c0' }}>
            Poster Studio hit an unexpected error and couldn't continue. Your last
            saved state may be damaged — you can reset the studio to start fresh.
          </p>
          <pre
            className="max-w-lg overflow-auto rounded-lg p-3 text-[11px]"
            style={{ background: '#1e1e30', color: '#9090c0', maxHeight: '120px' }}
          >
            {this.state.error.message}
          </pre>
          <button
            onClick={this.handleReset}
            className="rounded-xl px-5 py-2.5 text-[14px] text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c14]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            Reset studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
