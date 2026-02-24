import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

export const DashboardLayout = () => {
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
