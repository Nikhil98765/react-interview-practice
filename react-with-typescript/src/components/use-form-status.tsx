/* ============================================================================
   useFormStatus — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you click
     ❓ = could not be reproduced here
     `// => X` = measured in real Chrome (headless, puppeteer-core) on React 19.2.4.

   ▶️ npm run dev -> "Form Status" in the App.tsx switcher.

   CONTENTS
     1. The hook .................. what it returns, and where it must live
     2. Two actions, one form ..... telling buttons apart with `action`
     3. Gotchas ................... 4 of yours + 3 more ⚠️
     4. When not to use
     5. Exercise
     6. Interview Q&A 🎤

   THE MODEL 🧠
     useFormStatus is context, not state: it reads the submit status of the nearest <form>
     ABOVE the component that calls it. That is the whole point — a reusable submit button
     that knows it is submitting without the form passing it a single prop.
     It tracks FORM SUBMISSIONS, not transitions. A dispatcher called inside startTransition
     updates useActionState's isPending but never touches useFormStatus, because no form was
     submitted.

   💡 THE ONE-LINER: isPending is the form OWNER's flag; pending from useFormStatus is the
      CHILD's view of its parent form. One comes down the tree, the other comes up.
   ============================================================================ */

/**
 ** useFormStatus
    It's a hook which provides submit status of parent component's form in a child component. Best case is reusable submit component where it needs to know the pending state of form. Before this hook, we used to manually send pending state from parent to child as prop. 
    Returns {pending, data, method, action} = useFormStatus()
    ⚠️ NOT useFormState — that name still exists in react-dom 19 but it is the deprecated React 18
       canary API that became useActionState, and it returns [state, dispatch], not this object.
      pending => true / false (true only if this hook is used in a child component and parent comp has a form. otherwise always its false).
                 ✅ MEASURED: called in the SAME component as the <form>, pending stayed false
                    for the whole submit (the action still ran) — Gotcha 1.
      data => FormData being submitted
      method => 'GET' / 'POST'
      action => function which triggered the form action. Useful when multiple button has different formAction's defined and need to find out which action got triggered by parent form.
   * Note - works with plain action as well with useActionState
   * submit vs action
   * use submit when u can manually want to control the form submission (validation checks, prevent default, manual reset of form fields); use action when u want react handle it. action doesn't block the form submission but onSubmit can.
   ** standard approach: Mix action and onSubmit
   *     ✅ MEASURED: onSubmit with e.preventDefault() blocked the action entirely — the action
   *        never logged. Remove the gate and it runs. So preventDefault in onSubmit really is a
   *        gate in front of the action, and a blocked submit leaves useActionState's state
   *        untouched (nothing dispatched).
   *     1. run validation checks inside onSubmit and use the preventDefault gate to block the action to trigger for any errors.
   *     2. run the validation checks again in action because action can't trust client (client can be bypassed).
   *     3. Handle state for client errors; blocked submit never reaches action, so useActionState's state never changes. 
 */

import {
  startTransition,
  useActionState,
  useCallback,
  type ComponentPropsWithoutRef,
} from "react";
import { useFormStatus } from "react-dom";

const wait = (n: number) => {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, n);
  });
};

type State = {
  error: string;
  fields: {
    email: string;
  };
};

// a second, FASTER action so you can tell the two submits apart (exercise 4.1)
const saveDraft = async () => {
  await wait(2000);
};

const action2 = async (formData: FormData) => {
  await wait(4000);
  console.log(
    `🚀 ~ ParentForm ~ formData.get("email"):`,
    formData.get("email"),
  );
};

export const ParentForm = () => {
  // * Using dispatch of useActionState
  const actionHandler = useCallback(
    async (_prevState: State, formData: FormData) => {
      await wait(4000);
      return {
        error: "",
        fields: { email: (formData.get("email") ?? "") as string },
      };
    },
    [],
  );

  const [state, action, isPending] = useActionState(actionHandler, {
    error: "",
    fields: {
      email: "",
    },
  });
   
  // * Plain action (the alternative to useActionState — same form, no result state)
//   const action = useCallback(
//     async (formData: FormData) => {
//       await wait(4000);
//       console.log(`🚀 ~ ParentForm ~ formData.get("email"):`, formData.get("email"))
//     },
//     [],
//    );

  // Dispatch WITHOUT a form submit — this is the Gotcha 2 demo (exercise 3).
  const handleDispatch = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.set('email', 'dada@');
      action(formData);
    });
  };

  // ⚠️ FIXED: this <form> had no `action`, so the submit buttons fell through to a NATIVE
  //    submit — measured: clicking "Subscribe" navigated to ...?email= and reloaded the page,
  //    and the useActionState dispatcher was never called at all.
  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email: </label>
        <input
          type="text"
          id="email"
          name="email"
          defaultValue={state.fields.email}
        />
      </div>
      <SubmitButton>Subscribe</SubmitButton>
      <SubmitButton formAction={action2}>Play</SubmitButton>
      {/* ❌ DELIBERATE: `name` + a function formAction. React logs, on every render:
          'Cannot specify a "name" prop for a button that specifies a function as a formAction.' */}
      <button name="intent" formAction={action2}>
        Sample Button
      </button>
      <button type="button" onClick={handleDispatch}>
        Dispatch (no form submit)
      </button>
      <p>
        owner isPending = {String(isPending)} · last saved email = {state.fields.email || "(none)"}
      </p>
      {/* => MEASURED on the Dispatch button: owner isPending goes true while every
             SubmitButton stays enabled, because useFormStatus saw no submission (Gotcha 2). */}
    </form>
  );
};

// ⚠️ MEASURED: submitting via "Subscribe" made BOTH of these show "Subscribing...", because
//    this version's else-branch assumes "pending and not mine" means "mine". The other button's
//    formAction simply isn't the action that ran. TestSubmitButton further down gets it right:
//    isMine = pending && action === formAction, and anything else keeps its normal label.
const SubmitButton = ({
  children,
  ...buttonProps
}: ComponentPropsWithoutRef<"button">) => {
  const { pending, action } = useFormStatus();
  return (
    <button {...buttonProps}>
      {pending
        ? action === buttonProps.formAction
          ? "From action2 loader..."
          : "Subscribing..."
        : children}
    </button>
  );
};

/**
 ** Gotcha 1 - Calling it in the same component as the <form>
   Reads the form above the component, not the form the component renders.

   ✅ MEASURED: pending was false on every render of the component that owns the <form>, even
      while its own action was running. The form's own flag is useActionState's isPending.
 */

/**
 ** Gotcha 2 - only real form submissions count
   startTransition(() => dispatch(payload)) => doesn't give the pending and other form status in the child component when called with useFormStatus hook. 
   useFormStatus tracks the submissions of that form element but not transitions.
   only the useActionState in the same component as form is defined will provide the pending state for actions dispatched through transitions.

   ✅ MEASURED side by side:
        real form submit            -> child pending = true   owner isPending = true
        startTransition(dispatch)   -> child pending = FALSE  owner isPending = true
      That is the cleanest one-screen proof that the two hooks track different things.
 */

/**
 ** Gotcha 3 - no name on the button which has a function formAction
   react takes over the button's name in order to encode which action to run. To tell buttons apart use the `action` from useFormStatus (see TestSubmitButton's isMine check below) or assign each button its own action.
   Got the below error - 
   Cannot specify a "name" prop for a button that specifies a function as a formAction. React needs it to encode which action should be invoked. It will get overridden.

   ✅ MEASURED: that exact warning, logged on every render of ParentForm (the button is kept
      on purpose as the demo). Note it says "will get overridden" — the name is silently lost,
      so a server action that reads fd.get("intent") to branch would get nothing.
 */

/**
 ** Gotcha 4 - version
   In v19.3, a bug was fixed where the form status reset too early when the component state was updated during submit. If pending spinner flickers off, upgrade the version to v19.3. 

   ❓ NOT REPRODUCED here. On this project's React 19.2.4 I churned owner state every 80ms for
      the whole 600ms submit and pending stayed true the entire time (false, true×8, false).
      So either the trigger is narrower than "any state update", or this path isn't affected.
      ✅ What I could confirm: 19.3.0 is released, so "upgrade" is actionable — this project is
         still on 19.2.4 (package.json says ^19.2.0).
 */

/**
 ** Gotcha 5 - pending is form-wide, not button-wide ⚠️
   ✅ MEASURED on TestNewsLetterForm: clicking "Save Draft" disabled BOTH buttons, and clicking
      "Save" did the same in reverse. Every child reading useFormStatus sees the same pending.
   💡 That is exactly why you need `action === formAction` to decide which button shows its own
      spinner text — see section 2. Disabling both is usually what you want anyway: one form,
      one in-flight submit.
 */

/**
 ** Gotcha 6 - a <form> with no action falls back to the browser ⚠️
   ✅ MEASURED (the bug that was in ParentForm): with no `action` on the <form>, a submit button
      with no formAction does a NATIVE submit — the page navigated to ...?email= and reloaded,
      and the useActionState dispatcher never ran. React only takes over the submit when there
      is an action (or formAction) for it to call.
 */

/**
 ** Gotcha 7 - it reads the NEAREST form above it
   Nest a form inside another (invalid HTML, but it happens with portals and layout
   components) and the hook reports the closest ancestor's submit, not the one you meant.
   The hook has no "which form" argument — placement IS the API.
 */

/**
 *! When not to use
   1. form owner needs pending: use isPending from the useActionState. pending from useFormStatus gives the status of form which was defined in its parent component.
   2. The mutation isn't a form submit, (a like button or a drag and drop save); useTransition or useActionState's isPending flag.
   3. react-hook-form or onSubmit forms: no action, so nothing to read. use library's formState.isSubmitting
 */

/**
 ** Angular Parallel
   Inject ControlContainer / FormGroupDirective(for reactive forms) in reusable submit component, it can read the parent form where it sits in dependency tree and no input for child comp is needed to send it from parent is required in this approach 
 */

/**
 ** Exercise

   Build a reusable <SubmitButton> using useFormStatus and use it in your file-17 Newsletter form. You're done when you've seen:

   1. The button disables itself and shows "Saving…" during a submit, with no props passed from the form.
   2. Moving the useFormStatus call up into NewsLetterForm makes pending stay false. Then move it back.
   3. Your Dispatch button, running startTransition(() => dispatch(fd)), leaves <SubmitButton> enabled while isPending is true. That shows the two hooks tracking different things.
  4. Two submit actions in one form. (10 min)
      1. Add saveDraft at module level: async (fd) => { await wait(2000) }.
      2. Change <SubmitButton> to accept a formAction prop and pass it to its <button>.
      3. Render two of them: <SubmitButton formAction={action}>Save</SubmitButton> and <SubmitButton formAction={saveDraft}>Save draft</SubmitButton>.
      4.Inside <SubmitButton>, show "Saving…" only when pending && action === formAction.
      Done when: clicking "Save draft" shows "Saving…" on that button only, both buttons are disabled during either submit, and "Save" behaves the same way in reverse.

   ✅ ALL FOUR MEASURED:
      1. the button disabled itself and swapped its label with no props from the form.
      2. moving the hook into the form owner made pending stay false for the whole submit.
      3. startTransition(() => dispatch(fd)) left the buttons enabled while owner isPending
         was true — the two hooks, side by side (Gotcha 2).
      4. two actions in one form: only the clicked button showed its pendingText, both were
         disabled, and `action === formAction` is what distinguishes them.
 *  
*/
type TestState = { error: string, fields: { email: string } };

const testSubscribe = async (_prevData: TestState, formData: FormData): Promise<TestState> => {
  await wait(4000);
   const emailInput = String(formData.get('email') ?? '');
   if (!emailInput.includes('@')) {
      return {error: 'Invalid input', fields: {email: emailInput}};
   }
   return { error: '', fields: { email: emailInput } };
}

const TestNewsLetterForm = () => {
   const [state, action, isPending] = useActionState(testSubscribe, {
      error: '',
      fields: {email : ''}
   }); 

   return (
     <form action={action}>
       <div>
         <label htmlFor="email">Email: </label>
         <input
           type="text"
           id="email"
           name="email"
           defaultValue={state.fields.email}
         />
       </div>
       <TestSubmitButton formAction={action} pendingText="Saving...">
         Save
       </TestSubmitButton>
       <TestSubmitButton formAction={saveDraft} pendingText="Saving Draft...">
         Save Draft
       </TestSubmitButton>
       <p>
         owner isPending = {String(isPending)}
         {state.error && <span style={{ color: "red" }}> · {state.error}</span>}
       </p>
     </form>
   );
   // => MEASURED: idle [Save, Save Draft] -> clicking "Save Draft" gives
   //    [Save (disabled), "Saving Draft..." (disabled)] -> clicking "Save" gives
   //    ["Saving..." (disabled), Save Draft (disabled)]. Only the clicked button swaps its
   //    label, both disable, and the typed "bad" survived via the defaultValue echo. ✅
}

const TestSubmitButton = ({ children, formAction, pendingText }: { children: React.ReactNode, formAction: (formData: FormData) => void, pendingText: string }) => {
   const { pending, action} = useFormStatus(); 

   const isMine = pending && (action === formAction);
   return (
      <button disabled={pending} formAction={formAction}>{isMine ? pendingText: children}</button>
   )
}




export function FormStatusRoot() {
  return (
    <>
        {/* <ParentForm /> */}
        <TestNewsLetterForm />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What is useFormStatus for?
      A reusable submit button (or spinner, or disabled fieldset) that reads its parent form's
      submit state without the form passing props. It returns { pending, data, method, action }. (section 1)

 ** Q2. Why is my pending always false?
      You called it in the component that renders the <form>. It reads the nearest form ABOVE
      it — measured false for an entire submit. The owner uses useActionState's isPending. (Gotcha 1)

 ** Q3. isPending vs pending?
      isPending covers any dispatch, including startTransition(() => dispatch(fd)); pending
      covers real form submissions only. Measured: a transition dispatch gave isPending true
      and pending false. (Gotcha 2)

 ** Q4. Two submit buttons, two actions — how does the button know it's the one submitting?
      Compare the hook's `action` to the button's own formAction. pending is form-wide, so
      without that check both buttons show a spinner. (section 2, Gotcha 5)

 ** Q5. Why can't a button have both name and a function formAction?
      React uses the name to encode which action to invoke, so yours is overridden — it warns
      on every render. Give each button its own action instead. (Gotcha 3)

 ** Q6. Does it work with a plain action, or only useActionState?
      Both — it tracks the form submission, not the hook. (section 1)

 ** Q7. How do you run client validation and still use an action?
      onSubmit + e.preventDefault() as a gate in front of the action — measured: with the gate
      the action never ran. Re-validate inside the action too, since a blocked client never
      reached it and a real client can be bypassed. (section 1, "standard approach")

 ** Q8. react-hook-form has no action. What then?
      Nothing to read — use the library's formState.isSubmitting. (section 4)
 */

// 👉 NEXT: react-19-actions.tsx is the other half of this pair (the owner's view: pending,
//    result state, queued dispatches). Together they are the whole React 19 form story.
