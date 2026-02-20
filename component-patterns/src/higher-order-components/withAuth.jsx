// HOC should start with the word `with` followed by functionality.

export const withAuth = (Component) => {
  const isAuthenticated = true;
  return (props) => {
    return (isAuthenticated ? <Component {...props} /> : <p>User needs to be authenticated.</p>)
  }
}
