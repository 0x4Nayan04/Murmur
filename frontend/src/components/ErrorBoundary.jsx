import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-error/10">
            <AlertTriangle className="size-7 text-error" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-base-content">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-base-content/60">
            An unexpected error occurred. Reload the page or return home to
            continue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn-primary gap-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Reload
            </button>
            <Link to="/" className="btn btn-ghost">
              Go home
            </Link>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
