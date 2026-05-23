import React from 'react'

export const ErrorFallback = ({error, resetErrorBoundary}) => {
  return (
    <div role='alert'>
      <h2>Something went wrong</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  )
}
