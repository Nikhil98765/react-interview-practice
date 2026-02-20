import { Suspense } from "react";
import { UseHookExample } from "./components/use-hook"
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {

  const messagePromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      // reject('unavailable');
      resolve('Hello!')
    }, 2000);
  });

  return (
    <>
      <ErrorBoundary fallback={<p>Error occurred !</p>}>
        <Suspense fallback={<p>Message Loading...</p>}>
          <UseHookExample messagePromise={messagePromise} flag={true} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App
