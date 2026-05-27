
import React, { useState } from 'react'

export const Counter = () => {

  const [count, setCount] = useState(0);

  return (
    <div>
      <h3>Counter: {count}</h3>
      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>
    </div>
  )
}
