import React, { useRef } from 'react'

/**
 * Form handling 
 *      - using useRef (uncontrolled)
 *      - using FormData API (uncontrolled)
 * */ 

export const UnControlled = () => {
  // const nameRef = useRef('');
  //  const emailRef = useRef("");
 
   function handleSubmit(e) {
     e.preventDefault();
     //  console.log(nameRef.current.value, emailRef.current.value);
    //  Using FormData API
     const formData = new FormData(e.target);
     const formObj = Object.fromEntries(formData.entries());
     console.log("🚀 ~ handleSubmit ~ formObj:", formObj)
   }
 
   return (
     <form onSubmit={handleSubmit}>
       <div>
         <label htmlFor="name">Name: </label>
         <input
           type="text"
           id="name"
           name="name"
         />
       </div>
       <div>
         <label htmlFor="email">Email: </label>
         <input
           type="text"
           id="email"
           name="email"
         />
       </div>
       <button>Submit</button>
     </form>
   );
}
