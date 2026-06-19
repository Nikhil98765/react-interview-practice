import { useState, useTransition } from 'react';


const itemsLength = 20000;

// Simulates an expensive computation (e.g. filtering a large dataset)
// by building a large array synchronously on every keystroke.
const slowFilter = (value) => {
  const filteredResults = Array.from({ length: itemsLength }, () => value);
  return filteredResults
}

export const TransitionSearchExample = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  // isPending is true while the transition below is still rendering,
  // letting us keep the UI responsive instead of blocking on slowFilter.
  const [isPending, startTransition] = useTransition();


  const handleChange = (e) => {
    const value = e.target.value;

    // Update the input immediately so typing feels instant (urgent update).
    setQuery(value);

    // Mark the expensive results update as low-priority. React can interrupt
    // or defer this work (and skip stale renders) if the user keeps typing.
    startTransition(() => {
      const filteredResults = slowFilter(value);
      setResults(filteredResults);
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>useTransition - Search Example</h2>

      <input
        type="text"
        onChange={handleChange}
        value={query}
        placeholder="Type to search 10000 items..."
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />

      {isPending ? (
        <p style={{ color: 'orange' }}>⏳ Filtering... isPending = true</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Done... isPending = false</p>
      )}

      <ul style={{opacity: isPending ? 0.4 : 1, transition: 'opacity 0.2s'}}>
        {results.map((item, i) => 
          <li key={i}>{item}</li>
        )}
      </ul>
    </div>
  );
}
