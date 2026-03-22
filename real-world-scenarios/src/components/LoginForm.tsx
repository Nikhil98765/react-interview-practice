import { useForm, type SubmitHandler } from 'react-hook-form'
import { loginSchema, type LoginFormData } from '../utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';

export const LoginForm = () => {

  const { register, formState: { errors }, handleSubmit, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });
  
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      await loginUser(data);
    } catch(err: any) {
      setError('email', {
        type: 'server',
        message: 'This email is already registered'
      })
    }
  }

  async function loginUser(data: LoginFormData) {
    throw new Error('Email is already being used');
    console.log("🚀 ~ loginUser ~ data:", data)
  }



  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" {...register("email")} />
      </div>
      {errors.email && <p>{errors.email.message}</p>}
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" {...register("password")} />
      </div>
      {errors.password && <p>{errors.password.message}</p>}

      <button>Submit</button>
    </form>
  );
}
