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

export const loader =  async () => {
  const posts = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
  );
  console.log("🚀 ~ Inside loader function ~ posts");
  return posts.json();
}
