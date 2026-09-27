
import React, { forwardRef, useEffect, type ComponentPropsWithoutRef } from 'react';
import { useToggle } from '../hooks/useToggle';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, ...rest }, ref) => {
  // return <p>{ label.username.toUppercase()}</p> // error caught (render phase)
  const [val, toggle] = useToggle(false);

  useEffect(() => {
    // throw new Error("custom error from Input component"); // error caused in effects.
    // setTimeout(() => {  throw new Error("custom error from Input component's setTimeout"); }, 0); // error not caught
  }, []);

  // throw new Error("custom error from Input component"); -> error caught (render phase)

  return (
    <div>
      <label htmlFor="input">{label}</label>
      <input
        id="input"
        type="text"
        ref={ref}
        {...rest}
        onChange={() => {
          throw new Error("custom error from inline change event handler"); // error not caught
        }}
      />
    </div>
  );
});
