import { useRef, useState } from 'react'
import './App.css'
// import { Input } from './components/Input'
// import { List } from './components/List'
// import { ExerciseParent, Parent, Parent1, RefCallback, RefExample, RefsAttachExample } from './components/imperative-handle';
import { ErrorBoundary, ExerciseBuggyComp, ExerciseErrorBoundary, ExerciseFallbackComp, SaveButton, SiblingComp } from './components/ErrorBoundary';
import { SyncExternalStore } from './components/sync-external-store';

function App() {
  // const inputRef = useRef<HTMLInputElement>(null);

  const [resetKeys, setResetKeys] = useState<number[]>([]);

  const [boundaryKey, setBoundaryKey] = useState(0);

  // const clickHandler = () => {
  //   console.log("🚀 ~ App ~ inputRef:", inputRef.current.value);
  // }



  return (
    <>
      {/* <List
        items={[{ id: 1, name: 'test' }]}
        renderItem={(user) => <span>{user.name}</span>}
      /> */}
      {/* <ErrorBoundary fallback={<h1>Error occurred!</h1>}> */}
      {/* <Input ref={inputRef} label="email" />
        <button onClick={clickHandler}>Click</button> */}
      {/* <SaveButton></SaveButton> */}
      {/* </ErrorBoundary> */}
      {/* <Parent1 /> */}
      {/* <RefExample /> */}
      {/* <RefsAttachExample></RefsAttachExample> */}
      {/* <ExerciseParent></ExerciseParent> */}
      {/* <RefCallback /> */}
      {/* Error boundary exercise */}
      {/* <ExerciseErrorBoundary
        key={boundaryKey} // 4.b reset by key
        resetKeys={resetKeys}
        fallback={
          <ExerciseFallbackComp resetErrorCb={() => {
            // setResetKeys([ Math.random()]);
            setBoundaryKey(k => k + 1);
          }
          } />
        }
      >
        <ExerciseBuggyComp />
      </ExerciseErrorBoundary>
      <SiblingComp></SiblingComp> */}
      {/* useSyncExternalStore */}
      <SyncExternalStore />
    </>
  );
}

export default App
