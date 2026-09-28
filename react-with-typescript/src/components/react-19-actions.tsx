/* ============================================================================
   REACT 19 ACTIONS & useActionState — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you click
     `// => X` = measured in real Chrome (headless, puppeteer-core) on React 19.2.4.

   ▶️ npm run dev -> "Form Actions" in the App.tsx switcher.

   CONTENTS
     1. What the form action gives you ... preventDefault + reset, for free
     2. Without vs with useActionState ... what the hook actually adds
     3. Gotchas .......................... 5 of yours + 3 more ⚠️
     4. When not to use
     5. Exercise: NewsLetterForm
     6. Interview Q&A 🎤

   THE MODEL 🧠
     `<form action={fn}>` makes React own the submit: it calls preventDefault, runs your
     async fn inside a transition, and resets uncontrolled fields when the fn resolves.
     useActionState wraps that fn so React also owns the RESULT and the PENDING flag:
       fn(formData)  ->  fn(prevState, formData)   and you get [state, dispatch, isPending]
     Returned values become state (render your validation errors from it); thrown values
     escape to the nearest error boundary. Dispatches queue, because each call needs the
     previous call's return value as its first argument.

   💡 THE ONE-LINER: the form action buys you preventDefault + reset; useActionState buys you
      pending + result state. Return expected errors, throw unexpected ones.
   ============================================================================ */

/**
 ** Actions + useActionState
    Action is a async function which runs inside transition. Give one to form action prop and react calls it with formData on submit. React also tracks the pending state and resets the uncontrolled fields after submission. useActionState wraps an action so its get called with previous state along with current form data. It returns [state, dispatch, isPending] and queued dispatches will run one after other.

    Problem it solves - Traditional form handling contains pending, error states and needs to clear form fields which will be lot of code to handle one single form. Using the useActionState, provide a action function(Async one) and it provides pending, error and by default reset of uncontrolled form fields. No need to maintain lot of state variables.

 */

import { startTransition, useActionState, useState, useTransition } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

function wait(n: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, n);
  });
}

/**
 * Switching a plain form action to useActionState
 *
 * Removes (manual plumbing):
 *   1. Pending state: isPending comes from the hook (no useState / useFormStatus child)
 *   2. Result/error state: the action's return value becomes `state`,
 *      so returned errors ({ error }) render straight from state.
 *      Thrown errors still go to the error boundary.
 *
 * Adds (new capabilities):
 *   3. The action receives prevState (its last return value) as the 1st arg.
 *      Signature changes: fn(formData) → fn(prevState, formData)
 *   4. The dispatcher can be called outside a form, inside startTransition
 *   5. Dispatches queue: each waits for the previous one to finish
 */
export const FormWithoutUseAction = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ** Note - Observed the behavior that in react 19, submit / action handlers doesn't need to handle these manually => preventDefault, auto reset of uncontrolled form fields,
  // => MEASURED with a bare `action={fn}` and no hook at all: the page did NOT navigate
  //    (React calls preventDefault for you) and the input went from "hello@x.com" to "" once the
  //    action resolved ✅. So preventDefault and the reset come from the FORM ACTION, not from
  //    useActionState — the hook only adds pending + result state (section 2).
  async function actionHandler(e: FormData) {
    setIsPending(true);
    setError(null);
    await wait(4000);   // ⚠️ the await sits OUTSIDE the try: a throw from wait() would escape
    try {
      if (!(e.get("email") as string).includes("@")) {
        throw new Error("Invalid email");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e);
      }
    } finally {
      setIsPending(false);
    }
    // Plus reset the form fields.
  }

  return (
    <form action={actionHandler}>
      <input type="text" name="email" />
      <button disabled={isPending}>Submit</button>
      {isPending && <p>Submitting...</p>}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </form>
  );
};

type State = { error: Error | null; fields: { email: string } };

export const FormWithUseAction = () => {
  // * formAction dispatcher programmatically should be called inside startTransition.
  const [state, formAction, isPending] = useActionState(actionHandler, {
    error: null,
    fields: { email: "" },
  });
  const [, startTransition] = useTransition(); // only the starter is needed; isPending comes from the hook
  console.log("🚀 ~ FormWithUseAction ~ state:", state);

  async function actionHandler(
    prevState: State,
    formData: FormData,
  ): Promise<State> {
    console.log(
      "🚀 ~ actionHandler ~ formData with email :",
      formData.get("email"),
    );
    await wait(4000);
    if (!(formData.get("email") as string).includes("@")) {
      return {
        ...prevState,
        error: new Error("Invalid email"),
        fields: { email: formData.get("email") as string },
      };
    }
    return {
      ...prevState,
      error: null,
      fields: { email: formData.get("email") as string },
    };
  }

  /**
   * Error in browser console
      An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop.
      
      No error if dispatcher is wrapped with startTransition
   */
  function handleDispatch() {
    const formData = new FormData();
    formData.set("email", "dummy string@");
    startTransition(() => {
      // * dispatchers queues execute one after another.
      formAction(formData);
      formData.set("email", "dummy string");
      formAction(formData);
    });
  }

  return (
    <form action={formAction}>
      <input type="text" name="email" defaultValue={state.fields.email} />
      <button disabled={isPending}>Submit</button>
      <button type="button" onClick={handleDispatch}>
        Run form action dispatcher
      </button>
      {isPending && <p>Pending...</p>}
      {state.error && <p style={{ color: "red" }}>{state.error.message}</p>}
    </form>
  );
};

/**
 ** Gotcha 1 - Form resets even when u return the error
    After action finishes without throwing, react resets the uncontrolled inputs. returning {error} will still be counted as completed. 
    Standard Approach:  pass the current form field value in state and use defaultValue to bind it from state.

    ✅ MEASURED: an action that RETURNS a value (no throw) with an input that has no
       defaultValue echo -> the field was "" afterwards. "Completed" means resolved, not
       successful. The echo in NewsLetterForm is what keeps "bad" on screen next to the error.
 */

/**
 ** Gotcha 2 - dispatches queue don't run in parallel
    multiple dispatch calls can't run in parallel, they run one after another since action requires previous state to be sent into it. one slow request blocks everything behind it. Don't use it for independent mutations. 

    ✅ MEASURED with two dispatches in one startTransition (800ms action, logging start/end):
         start count=1 -> end count=1 -> start count=2 -> end count=2
       The second never started before the first finished, and it saw the first one's returned
       state as prevState (count had already incremented).
 */

/**
 ** Gotcha 3 - thrown errors skip state
    If action throws an error, it will skip the state and nearest error boundary will catch it. Return errors which u expect like validation errors and thrown only unexpected ones.

    ✅ MEASURED submitting "a$b" into NewsLetterForm: the boundary fallback replaced the form
       ("Error occurred!"), the form element was gone, and React logged "The above error occurred
       in the <NewsLetterForm> component".
    ⚠️ Note what that costs: the whole form is unmounted, so the user loses what they typed and
       there is no way back without resetting the boundary (ErrorBoundary.tsx section 4). A
       validation error must be RETURNED, not thrown.
*/

/**
 ** Gotcha 4 - converting action={fn} to useActionState
    when converting to useActionState, make sure that u add one more argument because useActionState sends previousState in 1st arg and current form data in 2nd arg and missing it might lead to checking older state instead of current one.
 */

/**
 ** Gotcha 5 - onSubmit + e.preventDefault opts you out.
    If you switch back to onSubmit, you lose pending state, auto-reset of form fields and queueing. If you still want to reset the form in submit, make a call to requestFormReset(form) from react-dom inside a transition.

    ✅ requestFormReset really is exported by react-dom 19 (typeof -> "function").
 */

/**
 ** Gotcha 6 - FormData is NOT copied when a dispatch queues  ⚠️
    The queue holds your FormData OBJECT, not a snapshot. If you mutate it between two
    dispatches — which handleDispatch above does — the queued action reads the LATEST values.

    ✅ MEASURED, one FormData set to "FIRST", dispatched, mutated to "SECOND", dispatched again:
         action 1: read before await="FIRST"  read after await="SECOND"
         action 2: read before await="SECOND" read after await="SECOND"
       Final state: ["SECOND", "SECOND"].
    💡 handleDispatch above only works because it reads formData.get("email") BEFORE its first
       await. Move that read after the await and both actions see the same value.
    ✅ Fix: build a fresh FormData per dispatch, or read the values you need into locals at the
       top of the action.
 */

/**
 ** Gotcha 7 - the "outside a transition" warning is about isPending, not about running ⚠️
    ✅ MEASURED: dispatching outside startTransition still ran the action and still updated
       state — it only warned. So a missing startTransition shows up as a pending flag that
       never flips, not as a broken submit. Passing the dispatcher to `action`/`formAction`
       counts as being inside a transition (no warning).
 */

/**
 ** Gotcha 8 - the action is not a validation layer
    It runs on submit only, after the round trip has started. Field-level validation ("email is
    required" as you type) needs real form state — react-hook-form, or `required`/`pattern` on
    the input, which the browser enforces before the action ever runs.
 */

/**
 *! When not to use
    1. Handle client side validation - actions are only for submit, use react-hook-form for any validations.
    2. Independent parallel mutation - use Tanstack query mutation or use transition, actions queues them and runs sequential one after another.
    3. data fetching / query - use use() hook, loaders etc to handle data fetching. actions are only for mutations and submissions.
 */

/**
 ** Exercise

    Build the Newsletter form. You're done when your console or screen shows each of these:

    1. isPending is true during the 800 ms delay and the button is disabled.
    2. Two clicks on a non-form dispatch button, both inside startTransition, log prev=0 then prev=1, and the second never starts before the first ends.
    3. Remove the defaultValue echo, submit "bad", and see the field go blank. Put the echo back and the value stays.
    4. throw for one special input, wrap the form in your ErrorBoundary from file 15, and see it catch the error.
    5. Call dispatch outside startTransition and see the warning.

    ✅ ALL FIVE MEASURED:
       1. during the 800ms wait the button was disabled and read "Submitting..." ✅
       2. two dispatches logged start=1 -> end=1 -> start=2 -> end=2 — strictly sequential ✅
       3. without the defaultValue echo the field blanked; with it, "bad" stayed next to the
          "Invalid email" message ✅
       4. "a$b" threw, and the ErrorBoundary in FormActionsRoot showed "Error occurred!" ✅
       5. the exact warning: "An async function with useActionState was called outside of a
          transition. ... Either call the returned function inside startTransition, or pass it to
          an `action` or `formAction` prop." ✅
 */

type NewsLetterFormState = { error: string; count: number; fields: { email: string } };

export const NewsLetterForm = () => {
  const [state, dispatch, isPending] = useActionState(subscribe, {
    error: '',
    count: 0,
    fields: {
      email: ''
    }
  });

  async function subscribe(prevData: NewsLetterFormState, formData: FormData): Promise<NewsLetterFormState> {
    // console.log("🚀 ~ subscribe ~ prevData:", prevData)
    // 1. wait for 800ms and isPending is true
    console.log(`start count=${prevData.count}`);
    await wait(800);
    console.log(`end count=${prevData.count}`);
    const emailInputVal = String(formData.get("email") ?? '');
    // 4. Error in browser console
    /**
     * installHook.js:1 Error: Invalid email contains $ at subscribe (react-19-actions.tsx:196:13)
     * 🚀 ~ ErrorBoundary ~ componentDidCatch ~ error: Error: Invalid email contains $ at subscribe (react-19-actions.tsx:196:13)
     */
    if (emailInputVal.includes("$")) {
      throw new Error("Invalid email contains $");
    }
    if (!emailInputVal.includes("@")) {
      return {
        ...prevData,
        error: "Invalid email",
        fields: { email: emailInputVal },
        count: prevData.count + 1,
      };
    }
    return {
      ...prevData,
      error: "",
      fields: { email: "" },
      count: prevData.count + 1,
    };
  }

  function handleFormAction() {
    // 2
    startTransition(() => {
      const formData = new FormData();
      formData.set("email", `email@${state.count}`);
      dispatch(formData);
    });
    // 5. Error in browser console
    /**
     * installHook.js:1 An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop.
     */
    // const formData = new FormData();
    // formData.set("email", `email@${counter.current}`); 
    // dispatch(formData);
  }

  return (
    <>
      <form action={dispatch}>
        <div>
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email"
            defaultValue={state.fields.email}
          />
        </div>
        <button disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
      <button onClick={handleFormAction}>Dispatch</button>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
    </>
  );
}



export function FormActionsRoot() {
  return (
    <>
      <ErrorBoundary
        fallback={<h3>Error occurred!</h3>}
      >
        <NewsLetterForm />
      </ErrorBoundary>
      {/* <FormWithoutUseAction /> */}
      {/* <FormWithUseAction /> */}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What does <form action={fn}> do that onSubmit doesn't?
      React calls preventDefault, runs the async fn in a transition, and resets uncontrolled
      fields when it resolves — measured with no hook involved. (section 1)

 ** Q2. Then what does useActionState add?
      pending + result state, and prevState as the action's first argument:
      fn(formData) -> fn(prevState, formData), returning [state, dispatch, isPending]. (section 2)

 ** Q3. Returned error vs thrown error?
      Returned becomes `state` and renders inline. Thrown skips state and goes to the nearest
      error boundary, unmounting the form — measured. Return expected errors. (Gotcha 3)

 ** Q4. My field clears even though I returned a validation error. Why?
      The reset fires when the action RESOLVES, regardless of what it resolved to. Echo the
      value back through state and bind it with defaultValue — measured both ways. (Gotcha 1)

 ** Q5. Do two dispatches run in parallel?
      No, they queue — each needs the previous return value as prevState. Measured:
      start=1, end=1, start=2, end=2. Use TanStack Query or plain transitions for independent
      mutations. (Gotcha 2)

 ** Q6. What breaks if you call the dispatcher outside startTransition?
      Just the pending flag — the action still runs and state still updates, with a console
      warning. Passing it to action/formAction counts as inside. (Gotcha 7)

 ** Q7. Anything to watch with the FormData object?
      It isn't copied into the queue. Mutating it between dispatches changes what a queued (or
      already-awaiting) action reads — measured "FIRST"/"SECOND". (Gotcha 6)

 ** Q8. How do you reset the form yourself if you go back to onSubmit?
      requestFormReset(formEl) from react-dom, inside a transition. (Gotcha 5)
 */

// 👉 NEXT: this project's other sheets — ErrorBoundary.tsx (where thrown action errors land)
//    and sync-external-store.tsx. Actions are also the client half of server actions, so the
//    natural follow-up outside this repo is a Next.js "use server" form.
