export const withDarkMode = (Component) => {
  const styles = {
    backgroundColor: '#212529',
    color: '#eee',
    height: '100vh'
  }
  return (props) => {
    return (
      <div style={styles}>
        <Component {...props} />
      </div>
    );
  }
}

