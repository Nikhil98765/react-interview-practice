import React, { memo, useDeferredValue, useState } from 'react';

// Stands in for an expensive render (e.g. a large list) so we can see
// useDeferredValue keep typing responsive by delaying this render.
const SlowList = ({ query }) => {
  const results = Array.from({ length: 20000 }, () => query);
  return (
    <ul>
      {results.map((listItem, i) => <li key={i}>{listItem}</li>)}
    </ul>
  );
};

// memo is required here: without it, SlowList would re-render on every
// parent render even when deferredQuery hasn't changed yet, defeating the
// point of deferring it.
const MemoSlowList = memo(SlowList);

export const DeferredValueExample = () => {

  const [query, setQuery] = useState('');
  // deferredQuery trails behind query - React updates the input immediately
  // but lets deferredQuery (and thus SlowList) lag behind under load,
  // re-rendering it in the background once the urgent work is done.
  const deferredQuery = useDeferredValue(query);
  // While query and deferredQuery differ, SlowList is still showing stale
  // data for the in-flight keystrokes - use this to dim/fade the stale UI.
  const isStale = query !== deferredQuery;

  return (
    <div>
      <h3>Deferred Example</h3>

      <div>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} />
        <div style={{opacity: isStale ? 0.5: 1}}>
          <MemoSlowList query={deferredQuery}/>
        </div>
      </div>
    </div>
  )
}
