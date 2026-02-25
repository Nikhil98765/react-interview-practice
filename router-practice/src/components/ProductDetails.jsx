import React from 'react'
import { Link, useParams } from 'react-router-dom'

export const ProductDetails = () => {
  const { productId } = useParams();
  
  return (
    <>
      <h2>ProductDetails</h2>
      <p>{productId}</p>
      {/* <Link to=".." relative='path'>Back</Link> */}
      <Link to=".." relative='route'>Back</Link>
    </>
  );
}

export const loader = async ({request, params}) => {
  console.log("🚀 ~ loader ~ params:", params)
  // Fetch any data using the params and return it to the component.
  
}
