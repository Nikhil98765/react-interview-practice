import { useEffect, useState } from 'react';
import './App.css';
import './utils/debouncing-throttling';
import { InfiniteScrolling } from './components/InfiniteScrolling';

function App() {

  const [query, setQuery] = useState('');
  // const [debouncedQuery, setDebouncedQuery] = useState('');

  // TODO: can be delegated to a custom hook
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedQuery(query);
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, [query]);

  // useEffect(() => {
  //   // Fetch the query based on the debounced query
  //   console.log("🚀 ~ App ~ debouncedQuery:", debouncedQuery)
    
  // }, [debouncedQuery]);


  return (
    // <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
    <InfiniteScrolling />
  )
}

export default App
