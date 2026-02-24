import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Home = () => {
  const navigate = useNavigate();

  // throw new Error('Error occurred');

  return (
    <div>
      Home
      <p>
        <Link to="/dashboard">Dashboard Page</Link>
      </p>
      <button onClick={() => navigate('dashboard')}>Navigate</button>
    </div>
  );
}
