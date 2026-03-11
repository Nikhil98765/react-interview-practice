
import React, { forwardRef, type ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, ...rest }, ref)  => {
  return (
    <div>
      <label htmlFor="input">{label}</label>
      <input id="input" type="text" ref={ref} {...rest} />
    </div>
  );
});
