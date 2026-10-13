'use client';

/* Client state living inside a LAYOUT. Its lifetime is the layout's lifetime, which makes it
   the simplest way to see when a layout is kept and when it is thrown away. */

import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>Increase count</button>
    </>
  )
}
