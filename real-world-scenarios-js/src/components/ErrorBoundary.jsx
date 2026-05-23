import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null}
  }

  // triggers during render, should not include any side-effects (pure).
  // Why static ? Avoids relying on component instance state or methods. Doesn't set the state directly but React takes the object it returns and uses it as the next state for error boundary
  static getDerivedStateFromError(error) {
    console.log("🚀 ~ getDerivedStateFromError ~ error:", error)
    return {hasError: true, error}
  }

  // Runs after error is caught, use - logging, analytics etc.
  componentDidCatch(error, errorInfo) {
    console.error("❌ ~ Caught Error:", error);
    console.log("🚀 ~ ComponentStack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      console.log("🚀 ~ Fallback renders:", this.props.fallback)
      return this.props.fallback;
    }
    return this.props.children;
  }
}