import React from 'react'
import { useRouteError } from 'react-router-dom'

export const Error = () => {
  const error = useRouteError();

  return <div>{error.message || error.status}</div>;
}
