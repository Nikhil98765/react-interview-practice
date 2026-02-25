import React, { Suspense } from 'react'
import { redirect, useLoaderData, Await, data } from 'react-router-dom';
import { fetchPost, fetchPosts } from '../utils/data-service';

export const Dashboard = () => {
  const { user, resolvedData } = useLoaderData();
  console.log("🚀 ~ Dashboard ~ user:", user);

  return (
    <>
      <h2>Dashboard</h2>
      <div>
        <h4>Resolved data</h4>
        <span>{ resolvedData.title}</span>
      </div>
      <div>
        <h4>Awaiting for data</h4>
        <Suspense fallback={<p>Loading Posts...</p>}>
          <Await resolve={user}>
            {(data) => {
              console.log("🚀 ~ Dashboard ~ data:", data);
              return <h1>data</h1>;
            }}
          </Await>
        </Suspense>
      </div>
    </>
  );
}

export const loader = async () => {

  // throw new Error('Error in dashboard loader');
  
  throw data({message: 'Failed to fetch posts'}, {status: '404'})

  // return {
  //   user: fetchPosts(),
  //   resolvedData: await fetchPost()
  // }

  // return redirect('/products');

  // const posts = await fetchPosts();
  // console.log("🚀 ~ Inside loader function ~ posts");
  // return posts;
}
