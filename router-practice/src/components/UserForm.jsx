import React from 'react'
import { data, Form, useActionData, useSubmit } from 'react-router-dom';

export const UserForm = () => {

  const actionData = useActionData();
  const submit = useSubmit();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    // const formObject = Object.fromEntries(formData.entries());
    // submit(formObject, {
    //   method: "POST",
    //   encType: 'application/x-www-form-urlencoded'
    // });
    submit(formData, {method: 'POST'})
  }

  return (
    <>
      <h3>User Form</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" id="userName" name="userName" />
        {actionData?.error && <p>{actionData.error}</p>}
        <button>submit</button>
      </form>
    </>
  );
}

export const action = async ({request, params}) => {
  const formData = await request.formData();
  const userName = formData.get('userName');

  if (userName === '') {
    // return {error: 'user name should not be empty'}
    throw data({message: 'Failed to submit data'}, {status: 500})
  }

  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify({
      title: userName,
      body: "bar",
      userId: 1,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
}

