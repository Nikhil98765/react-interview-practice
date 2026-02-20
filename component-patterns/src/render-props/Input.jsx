import React, { useState } from 'react'

export const Input = ({ render }) => {
  const [amount, setAmount] = useState(0);

  function handleChange(e) {
    setAmount(e.target.value);
  }

  return (
    <>
      <input type="number" placeholder='Enter amount...' onChange={handleChange}/>
      {render(amount)}
    </>
  )
}
