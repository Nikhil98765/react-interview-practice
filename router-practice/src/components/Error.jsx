import React from 'react'
import { useRouteError } from 'react-router-dom'

export const Error = () => {
  const error = useRouteError();

  return (
    <>
      <h1>{error?.status}</h1>
      <h3>{error?.data?.message || error.message}</h3>
    </>
  );
}
