import React from 'react'
import { Link } from 'react-router-dom'

export const Home = () => {

  // throw new Error('Error occurred');

  return (
    <div>
      Home
      <p>
        <Link to="/dashboard">Dashboard Page</Link>
      </p>
    </div>
  );
}
