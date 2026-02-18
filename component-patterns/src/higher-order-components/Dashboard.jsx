import { withAuth } from "./withAuth"
import { withDarkMode } from "./withDarkMode";

const Dashboard = () => {
  return (
    <p>Your Dashboard</p>
  )
}

const withAuthDashboard = withDarkMode(withAuth(Dashboard));

export default withAuthDashboard;
