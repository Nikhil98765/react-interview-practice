import React, { Suspense, useState, useTransition } from 'react';

// Wraps a promise in the "read" pattern Suspense expects: while pending,
// read() throws the promise itself so Suspense can catch it and show the
// fallback; once settled, read() throws the error or returns the value.
const wrapPromise = (promise) => {

  let status = 'pending';
  let result;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      result = res;
    },
    (err) => {
    status = 'error';
    result = err;
    }
  );

  return {
    read: () => {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    }
  }
}

// Simulates a network request whose latency depends on the tab, so
// switching tabs shows Suspense fallbacks/transitions for different durations.
function fetchTabData(tabName) {
  const delays = { home: 0, profile: 1200, settings: 2000 };

  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(
          {
            home: {
              title: 'Home',
              lines: ['Welcome back!', 'Active users: 1,240', 'Revenue: $48,200'],
            },
            profile: {
              title: 'Profile',
              lines: ['Name: Nikhil', 'Role: Full Stack Dev', 'Projects: 12'],
            },
            settings: {
              title: 'Settings',
              lines: ['Theme: Dark', 'Notifications: On', '2FA: Enabled'],
            },
          }[tabName])},
      delays[tabName],
    );
  })
}

// Caches one resource per tab so revisiting a tab reuses its already-settled
// promise instead of re-fetching and re-suspending every time.
const resourcedCache = {};

function getTabResource(name) {
  if (!resourcedCache[name]) {
    resourcedCache[name] = wrapPromise(fetchTabData(name));
  }
  return resourcedCache[name];
}

function Tab({ name }) {
  const resource = getTabResource(name);
  // read() throws while pending, which Suspense catches to render the fallback.
  const data = resource.read();

  return (
    <div>
      <h3>{ data.title}</h3>
      <ul>
        {data.lines.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export const TransitionTabExample = () => {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const tabs = ['home', 'profile', 'settings']

  // Wrapping the tab change in startTransition keeps the old tab's content
  // on screen (instead of immediately falling back to the Suspense fallback)
  // while the new tab's data is fetched, and exposes isPending for UI feedback.
  const handleTabClick = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>useTransition Example - Tab Switching</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => handleTabClick(t)}
            style={{
              fontWeight: tab === t ? 'bold' : 'normal',
              opacity: isPending && tab === t ? 0.5 : 1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isPending ? (
        <p style={{ color: 'orange' }}>⏳ Loading tab... isPending = true</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Ready - isPending = false</p>
      )}

      <div style={{opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s'}}>
        <Suspense fallback={<p>Loading tab content ... (fallback)</p>}>
          <Tab name={tab}></Tab>
        </Suspense>
      </div>
    </div>
  );
}
