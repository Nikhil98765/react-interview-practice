import React from 'react'
import { useParams } from 'react-router-dom'

export const ProductDetails = () => {
  const { productId } = useParams();
  
  return (
    <>
      <h2>ProductDetails</h2>
      <p>{productId}</p>
    </>
  );
}
