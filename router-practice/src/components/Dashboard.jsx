import React from 'react'
import { useLoaderData } from 'react-router-dom';

export const Dashboard = () => {
  const data = useLoaderData();
  console.log("🚀 ~ Dashboard ~ data:", data);

  return (
    <>
      <h2>Dashboard</h2>
    </>
  );
}
