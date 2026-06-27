import { useNavigate } from "react-router"


export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      HomePage
      <button onClick={() => navigate('/dashboard')}>Dashboard</button>
    </div>
  )
}
