import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export const Counter = () => {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const renderCount = useRef(0);
  renderCount.current++;

  return (
    <div>
      <h2>Rendered count: { renderCount.current}</h2>
      <h3>Counter: {count}</h3>
      <button onClick={() => {
        flushSync(() =>
          setCount((prev) => prev + 1)
        );
        setFlag(prev => !prev);
      }}>
        Increment
      </button>
    </div>
  );
};
