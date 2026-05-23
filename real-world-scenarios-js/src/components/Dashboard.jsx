import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { useAxios } from '../context/AxiosContext';

export const Dashboard = () => {

  const { logout } = useAuth();
  const axiosPrivate = useAxios();

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);


  if(error) {
    throw new Error('Boom');
  }


  useEffect(() => {
    axiosPrivate.get('/auth/me')
      .then(res => setProfile(res.data))
      .catch((err) => console.error("❌ Failed to fetch profile:", err));
    
    axiosPrivate.get('/products?limit=5')
      .then(res => setProducts(res.data.products))
      .catch(err => console.error("❌ Failed to fetch products:", err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => setError(true)}>Throw Error</button>

      {profile && (
        <div>
          <img src={profile.image} alt={profile.username} width={64} />
          <p>{profile.firstName} {profile.lastName}</p>
          <p>{profile.email}</p>
        </div>
      )}

      <h3>Products</h3>
      <ul>
        {products.map(product => <li key={product.id}>{product.title} - ${product.price}</li>)}
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  )
}
