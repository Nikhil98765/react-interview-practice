import React, { useRef } from 'react'

export const UnControlled = () => {
  const nameRef = useRef('');
   const emailRef = useRef("");
 
   function handleSubmit(e) {
     e.preventDefault();
     console.log(nameRef.current.value, emailRef.current.value);
   }
 
   return (
     <form onSubmit={handleSubmit}>
       <div>
         <label htmlFor="name">Name: </label>
         <input
           type="text"
           id="name"
           ref={nameRef}
         />
       </div>
       <div>
         <label htmlFor="email">Email: </label>
         <input
           type="text"
           id="email"
           ref={emailRef}
         />
       </div>
       <button>Submit</button>
     </form>
   );
}
