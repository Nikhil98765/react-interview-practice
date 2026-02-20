import React from 'react';
import FormHandler from './FormHandler';

const RApp = () => {
  return (
    <div>
      <FormHandler
        render={
          (formData, error, handleChange, handleSubmit) => {
            return (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  placeholder="user name"
                  onChange={handleChange}
                />
                {error.username && <div>{error.username.msg}</div>}
                <input
                  type="text"
                  name="password"
                  placeholder="password"
                  onChange={handleChange}
                />
                {error.password && <div>{error.password.msg}</div>}
                <button type="submit">Submit</button>
              </form>
            );
          }
        }
      />
    </div>
  );
};

export default RApp;