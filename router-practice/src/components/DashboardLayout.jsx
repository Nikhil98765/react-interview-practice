import React from 'react'
import { Link, NavLink, Outlet, useRouteLoaderData } from 'react-router-dom'

export const DashboardLayout = () => {

  const data = useRouteLoaderData('dashboardData');
  console.log("🚀 ~ DashboardLayout ~ data:", data)

  return (
    <>
      <h2>DashboardLayout</h2>
      <nav>
        <span>
          <NavLink
            to="profile"
            className={({isActive}) => (isActive ? "active" : "")}
          >
            Profile
          </NavLink>
        </span>
        <span>
          <NavLink
            to="settings"
            className={({isActive}) => (isActive ? "active" : "")}
          >
            Settings
          </NavLink>
        </span>
      </nav>
      <Outlet />
    </>
  );
}
