import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor() {
    super();
    this.state = { hasError: false, error: null };
  }

  // Required static method implementation to make a component into error boundary component.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // To access more error info
  componentDidCatch(error, info) { 
    console.error('Error caught: ', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
