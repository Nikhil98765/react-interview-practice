'use client';

import { useState } from "react";

export const LabelledCounter = ({ label }: { label: string }) => {
  const [count, setCount] = useState(0);
  return (
    <p>
      <button onClick={() => setCount((c) => c + 1)}>{label}: {count}</button>
    </p>
  );
};
