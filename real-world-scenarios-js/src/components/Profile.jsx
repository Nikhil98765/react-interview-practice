import React, { useState } from 'react';

export const Profile = () => {
  const [error, setError] = useState(false);

  if (error) {
    throw new Error('Boom');
  }

  return (
    <div>
      <h2>Profile</h2>
      <button onClick={() => setError(true)}>Throw Error</button>
    </div>
  );
};
