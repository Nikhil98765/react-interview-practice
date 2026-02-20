import React, { useState } from 'react';

const FormHandler = ({render}) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, type, value } = e.target;
    if (value === '') {
      setError(prev => ({ ...prev, [name]: { msg: 'required field...' } }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData.entries());
    console.log("🚀 ~ handleSubmit ~ formObj:", formObj);
  }

  return (
    <div>
      {render(formData, error, handleChange, handleSubmit)}
    </div>
  );
};

export default FormHandler;