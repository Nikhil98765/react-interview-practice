import { json, redirect } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function AuthenticationPage() {
  return <AuthForm />;
}

export const action = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode');
  
  const formData = await request.formData();
  const authObj = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  const response = await fetch(`http://localhost:8080/${mode}`, {
    method: 'POST',
    body: JSON.stringify(authObj),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw json({message: 'Could not authenticate user.'}, {status: 500})  
  }

  const responseObj = await response.json();
  localStorage.setItem('token', responseObj.token);
  
  return redirect('/');
}

export default AuthenticationPage;