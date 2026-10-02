/* ============================================================================
   DEMO SWITCHBOARD — react-with-typescript
   ============================================================================
   Each sheet in src/components exports demo components; this file mounts ONE at a time.
   Pick from the buttons in the browser instead of commenting/uncommenting JSX — that's also
   what keeps this file free of unused-import errors (`tsc -p tsconfig.app.json --noEmit`).

   THE SHEETS
     imperative-handle.tsx ....... refs, forwardRef vs React 19 ref-as-prop, useImperativeHandle
     ErrorBoundary.tsx ........... what a boundary catches, resetting, Suspense pairing
     sync-external-store.tsx ..... reading external state without tearing
     react-19-actions.tsx ........ form actions, useActionState, queued dispatches
     use-form-status.tsx ......... a child reading its parent form's submit state
     Input.tsx / List.tsx ........ typed props, generics, forwardRef'd input

   ⚠️ "Bad snapshot (locks the tab)" is deliberately destructive — it demonstrates the
      infinite loop from sync-external-store.tsx Gotcha 1. Reload to recover.
   ============================================================================ */

import { useState, type ReactNode } from 'react';
import './App.css';
import { Input } from './components/Input';
import { List } from './components/List';
import { ExerciseParent, Parent, Parent1, RefCallback, RefExample, RefsAttachExample } from './components/imperative-handle';
import { ErrorBoundary, ExerciseBuggyComp, ExerciseErrorBoundary, ExerciseFallbackComp, SaveButton, SiblingComp } from './components/ErrorBoundary';
import { BadSnapshotDemo, StoreTestCountComponent, StoreTestNameComponent, SyncExternalStore, TestExerciseComponent, TestMiniStore } from './components/sync-external-store';
import { FormActionsRoot, FormWithoutUseAction, FormWithUseAction } from './components/react-19-actions';
import { FormStatusRoot, ParentForm } from './components/use-form-status';

// The error-boundary exercise needs the parent to own the reset state, so it gets its own wrapper.
function ErrorBoundaryExercise() {
  const [resetKeys, setResetKeys] = useState<number[]>([0]);
  const [boundaryKey, setBoundaryKey] = useState(0);

  return (
    <>
      <ExerciseErrorBoundary
        key={boundaryKey}                              // 4.b reset by key -> child REMOUNTS
        resetKeys={resetKeys}                          // 4.a reset by keys -> child keeps its state
        fallback={
          <ExerciseFallbackComp resetErrorCb={() => setBoundaryKey(k => k + 1)} />
        }
      >
        <ExerciseBuggyComp />
      </ExerciseErrorBoundary>
      <SiblingComp />
      <p>
        <button onClick={() => setResetKeys([Math.random()])}>Reset via resetKeys (no remount)</button>
        <button onClick={() => setBoundaryKey(k => k + 1)}>Reset via key (remount)</button>
      </p>
    </>
  );
}

function TypedComponents() {
  return (
    <>
      <List items={[{ id: 1, name: 'test' }]} renderItem={(user) => <span>{user.name}</span>} />
      <ErrorBoundary fallback={<h1>Error occurred!</h1>}>
        <Input label="email" />
        <SaveButton />
      </ErrorBoundary>
    </>
  );
}

const DEMOS: { id: string; label: string; node: ReactNode }[] = [
  {
    id: "store-selectors",
    label: "Store: selectors",
    node: (
      <>
        <StoreTestNameComponent />
        <StoreTestCountComponent />
      </>
    ),
  },
  { id: "store-mini", label: "Store: mini store", node: <TestMiniStore /> },
  {
    id: "store-online",
    label: "Store: online status",
    node: <SyncExternalStore />,
  },
  {
    id: "store-exercise",
    label: "Store: exercise",
    node: <TestExerciseComponent />,
  },
  {
    id: "store-bad",
    label: "⚠️ Bad snapshot (locks the tab)",
    node: <BadSnapshotDemo />,
  },
  {
    id: "eb-exercise",
    label: "Error boundary: exercise",
    node: <ErrorBoundaryExercise />,
  },
  {
    id: "refs-forward",
    label: "Refs: forwardRef vs plain prop",
    node: <Parent />,
  },
  { id: "refs-handle", label: "Refs: imperative handle", node: <Parent1 /> },
  { id: "refs-callback", label: "Refs: callback refs", node: <RefCallback /> },
  {
    id: "refs-observer",
    label: "Refs: observer cleanup",
    node: <RefExample />,
  },
  {
    id: "refs-timing",
    label: "Refs: attach timing",
    node: <RefsAttachExample />,
  },
  {
    id: "refs-video",
    label: "Refs: VideoPlayer exercise",
    node: <ExerciseParent />,
  },
  { id: "typed", label: "Typed props / generics", node: <TypedComponents /> },
  { id: "actions-newsletter", label: "Actions: newsletter + boundary", node: <FormActionsRoot /> },
  { id: "actions-manual", label: "Actions: manual plumbing (no hook)", node: <FormWithoutUseAction /> },
  { id: "actions-hook", label: "Actions: useActionState + queueing", node: <FormWithUseAction /> },
  { id: "form-status", label: "Form status: two actions", node: <FormStatusRoot /> },
  { id: "form-status-parent", label: "Form status: formAction + dispatch", node: <ParentForm /> },
];

function App() {
  const [active, setActive] = useState(DEMOS[0].id);
  const demo = DEMOS.find(d => d.id === active);

  return (
    <>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {DEMOS.map(d => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            style={{ fontWeight: d.id === active ? 700 : 400 }}
          >
            {d.label}
          </button>
        ))}
      </nav>
      <hr />
      {demo?.node}
    </>
  );
}

export default App
