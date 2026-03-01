
import React from 'react'
import { useFetcher } from 'react-router-dom'

export const Newsletter = () => {
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = (fetcher.state === 'idle') && fetcher.data?.success;
  const error = fetcher.data?.error;

  return (
    <div>
      <h4>Subscribe to Newsletter</h4>
      {
        isSuccess ? 
          (<p style={{ color: 'green' }}>✅ {fetcher.data.message}</p>) : 
          (
            <fetcher.Form method='post' action="/newsletter">
              <input type="email" name='email' placeholder='Enter your email' disabled={isSubmitting} />
              <button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...': 'Subscribe'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </fetcher.Form>
          )
      }
    </div>
  )
}



export const action = async ({request}) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || !email.includes('@')) {
    return {error: 'Please enter a vaild email address.'}
  }

  await new Promise(resolve => setTimeout(resolve, 100));
  return {success: true, message: `${email} subscribed successfully!`}
}