import { use } from "react";


export const UseHookExample = ({ messagePromise, flag }) => {
  let message = '';
  
  if (flag) {
     message = use(messagePromise);
  } else {
    message = 'please set the flag';
  }

  return (
    <div>
      {message}
    </div>
  )
}
