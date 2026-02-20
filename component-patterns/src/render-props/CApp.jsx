import React from 'react'
import { Input } from './Input'
import { USD } from './USD';
import { Pound } from './Pound';

export const CApp = () => {
  return (
    <div>
      <Input render={(amount) => {
        return (
          <>
            <USD amount={amount}></USD>
            <Pound amount={amount}></Pound>
          </>
        );
      }} />
    </div>
  )
}
