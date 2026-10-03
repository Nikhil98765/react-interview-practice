/* ============================================================================
   useOptimistic — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you click
     `// => X` = measured in real Chrome (headless, puppeteer-core) on React 19.2.4, by logging
     the rendered list on EVERY render with a timestamp. `X*` below means "X, still optimistic".

   ▶️ npm run dev -> the "Optimistic: ..." entries in the App.tsx switcher.

   CONTENTS
     1. The hook .................. simple form and reducer form
     2. Gotchas ................... 4 of yours + 3 more ⚠️
     3. When not to use
     4. Exercise: the message thread
     5. Interview Q&A 🎤

   THE MODEL 🧠
     useOptimistic(realState, reducer) gives you a value that is the real state PLUS any
     optimistic updates made by actions that are still running. It is not a second copy of
     state: every render recomputes it from the real state.
     When the action finishes, its optimistic update is dropped. What you see next is simply
     the real state — so "it stayed" means you updated the real state in time, and "it
     reverted" means you didn't (or the request failed). React never rolls anything back;
     it just stops adding the temporary layer.

   💡 THE ONE-LINER: an optimistic value is a temporary overlay tied to an action's lifetime.
      Success is "the real state now matches"; failure is "the overlay disappears".
   ============================================================================ */

/**
 ** useOptimistic
    It shows a temporary value while action is running. Once the action is finished, react drops the value and shows the real state again. If action succeeds and nothing changes, it keeps the value but if it failed, UI reverts. But we don't write the revert code, react handles it for us using this hook.

    Real example:
    when u like a post, user doesn't need to wait for 500ms from server to see the like. Manually way of handling this case
     setState => useEffect => call API => success => no changes to UI (since setState already updated the value)
                                                  => revert the state to it previous state => sometimes this can wrong due to multiple requests and forget to rollback.
    useOptimistic handles the value to be bound to the action, so when the action completes if it failed rollback happens automatically.

    ** Angular parallel: update the signal, call the service and restore the old value using catchError.
    ** In one line, useOptimistic handles the restore step automatically and it is bound to an action. It doesn't rollback magically, the real state is shown once the action completes.

    ✅ That last line is the accurate one. "If action succeeds ... it keeps the value" (above) is
       how it LOOKS, not what happens: the optimistic value is ALWAYS dropped when the action
       ends. Measured — an action that succeeded but never updated real state rendered [X*] and
       then [] (Gotcha 1).
 */

import { startTransition, useCallback, useOptimistic, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

function wait(n: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, n);
  });
}

// always fails — so the like below demonstrates the automatic "revert"
async function likePost(id: string) {
  await wait(4000);
  throw new Error(`failed to like post ${id}`);
}

async function sendMessage(text: string) {
  await wait(4000);
  return text;      // the "server" echoes it back
}

type Message = { text: string; sending?: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE HOOK — simple form ❤️
// ─────────────────────────────────────────────────────────────────────────────
// 📝 predict: the request ALWAYS fails after 4s. What does the count do, and who reverts it?
export const LikeDemo = ({ id }: { id: string }) => {
  const [likes, setLikes] = useState(0);
  // ** Simple form
  const [optLikes, setOptLikes] = useOptimistic(likes);

  const action = useCallback(async () => {
    setOptLikes((prev) => prev + 1);
    try {
      await likePost(id);
      startTransition(() => {
        setLikes((l) => l + 1);
      });
    } catch {
      // nothing to undo: the overlay is dropped when this action ends, and `likes` never changed
    }
  }, [id, setOptLikes]);

  return (
    <form action={action}>
      <button>❤️ {optLikes}</button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE HOOK — reducer form 💬  (the default for lists)
// ─────────────────────────────────────────────────────────────────────────────
export const LikeButton = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  // ** Reducer form: default for lists.
  const [optMessages, addOptMessages] = useOptimistic(
    messages,
    (current, text: string) => [...current, { text, sending: true }],
  );

  // function buttonClick() {
  //   /**
  //    *! Error in console: An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition.
  //       If setter of opt state got triggered outside action, above is the error message in console. so, always trigger inside a action or inside a startTransition.
  //    */
  //   addOptMessages("random");
  // }

  const sendMessageAction = useCallback(
    async (formData: FormData) => {
      const messageText = String(formData.get("messageInput") ?? "");
      addOptMessages(messageText + " (sending...)");
      try {
        await sendMessage(messageText);
        startTransition(() => {
          setMessages((prev) => [...prev, { text: messageText }]);
        });
      } catch {
        // ⚠️ swallowing here means a failed send just VANISHES from the list with no message
        //    (Gotcha 5). Surface it: return an error into state, or rethrow to a boundary.
      }

      console.log("🚀 ~ LikeButton ~ action completed: ", messageText);
    },
    [addOptMessages],
  );

  return (
    <>
      <ul>
        {optMessages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
      <form action={sendMessageAction}>
        <input
          type="text"
          name="messageInput"
          placeholder="Type a message..."
        />
        <button>Send</button>
      </form>
      {/* <button onClick={buttonClick}>Increase messages</button> */}
    </>
  );
};

/**
 ** Gotcha 1 - Update the real state before the action ends.
    useOptimistic will drop its value and show the real state once the actions finishes. It is tied to an action. If no update on real state, happened before the action ends then UI will show the change for 2s and revert it which looks exactly like a failed request. try to wrap the block after await which includes real state update inside the startTransition so that real state update happens in same render cycle as action.

    ** Reason to wrap real state update with startTransition after await:
      when JS sees await, it pauses execution and gives control back to caller. once API succeeds, react lost track that it is inside an action and whatever the lines were after await (real state updates) will consider them as eagerly and render them right away. Since action runs inside an transition, wrap the await after code inside startTransition to render them in same cycle once the action completes.
      If no startTransition is wrapped around code after await, we see same item twice on UI (one is useOptimistic and one from real state).

    ✅ ALL THREE CASES MEASURED (400ms action, list logged on every render):
         real state never updated        -> [X*] -> []              looks exactly like a failure
         updated inside startTransition  -> [X*] -> [X]             one clean swap
         updated WITHOUT startTransition -> [X*] -> [X, X*] -> [X]  the duplicate you described,
                                                                    for one render (~4ms)
    💡 WHY the duplicate: the urgent setMessages commits first, and the still-pending optimistic
       update is re-applied ON TOP of the new real state (that's what the reducer is for). Only
       when the action then ends is the overlay dropped. startTransition puts the real update
       in the same batch as the action finishing.
 */

/**
 ** Gotcha 2 - overlapping actions finish together.
    send 'X' and then 'Y' before 'X' returns. Even if 'X' finishes early, it still stays in its optimistic form until 'Y' is finished.
    Verification - In above example, send 2 messages right away. Even though first action got completed, it stays in its optimistic form and wait for Y to complete and render in the same cycle.
    React groups overlapping async actions and commits them together. 

    ✅ MEASURED with X = 300ms and Y = 1200ms started together:
         1246ms  render [X*, Y*]
         1547ms  action X finished          <- nothing re-renders
         2447ms  action Y finished
         2448ms  render [X, Y]              <- both flip in ONE render
       X sat in its optimistic form for 900ms after its own request had succeeded.
    ⚠️ So one slow request holds every earlier "sending..." indicator hostage. If that matters,
       track per-item status in real state instead of relying on the overlay.
 */

/**
 ** Gotcha 3 - Only for display
    never send the useOptimistic values to server or use it to make decisions. UI may revert back. Read the real state for logic and optimistic value only for rendering purpose.
 */

/**
 ** Gotcha 4 - calling optimistic updater in a plain function
    In dev mode, error is thrown when we invoke the optimistic updater outside the action / startTransition. optimistic is tied to an action, always use it inside action / startTransition. See buttonClick in TestComponent below.

    ⚠️ One correction, measured: nothing is THROWN. The call returns normally and React logs
         "An optimistic state update occurred outside a transition or action. To fix, move the
          update to an action, or wrap with startTransition."
       via console.error — and the update is silently DROPPED (the list stayed empty). So a
       try/catch won't see it and an error boundary won't catch it; the symptom is "nothing
       happened" plus a console message.
 */

/**
 ** Gotcha 5 - a swallowed failure is an unexplained disappearance ⚠️
    The revert is automatic, the EXPLANATION is not. With `catch {}` around the request the
    item just vanishes (measured as [X*] -> []), and the user can't tell a failure from a
    glitch. Pair the revert with feedback: return an error into state, show a toast, or
    rethrow to a boundary as TestComponent does.
 */

/**
 ** Gotcha 6 - the reducer re-runs on top of new real state, so it must be pure
    The optimistic value is recomputed every render as reducer(realState, pendingUpdate).
    That's what produced [X, X*] above. A reducer that mutates `current`, generates an id
    with Math.random(), or reads the clock gives a different answer on each re-run.
 */

/**
 ** Gotcha 7 - key={index} hides a remount when the real item arrives
    Here the optimistic item and the real one share an index, so the <li> is reused. With
    server-generated ids the key changes when the real row lands, the element remounts, and
    any focus or animation state is lost. Give the optimistic item a temporary client id and
    keep it on the real one.
 */

/**
 *! When not to use
    1. When action is likely to fail and failure would be confusing to see reverted (bank payments and booking). show the pending state instead.
    2. For UI's which depends on server generated ID's and ordering.
    3. If you already use tanstackQuery, use the library's optimistic update instead of combining two.
*/

/**
 ** Exercise

    Time box: 20 min

    Setup (module level):

      type Msg = { text: string; sending?: boolean }
      async function sendMessage(text: string): await wait(3000), then throw new Error('Send failed') if text includes "fail".

    Component <Thread>:

      const [messages, setMessages] = useState<Msg[]>([])
      useOptimistic(messages, reducer), where the reducer appends { text, sending: true }.
      A <form action={sendAction}> with <input name="text" /> and a plain submit <button>.
      sendAction(fd): read text, call addOptimistic(text), await sendMessage(text), then startTransition(() => setMessages(m => [...m, { text }])).
      Render the optimistic list, adding " (sending…)" when msg.sending is true.
      Wrap <Thread> in your file-15 ErrorBoundary.

    ✅ MEASURED on TestComponent below:
         send "hello"          -> ["hello (sending...)"] for 3s, then ["hello"]
         send "this will fail" -> ["hello", "this will fail (sending...)"], then the action
                                  throws: the ErrorBoundary fallback replaces the whole thread
                                  (list gone, "Error occurred !" shown)
       ⚠️ Note the cost of rethrowing: one failed message unmounts every message. Fine for the
          exercise; in a real thread you'd keep the list and mark that one item as failed.
 */

type TestMsg = { text: string; sending?: boolean };

async function sendMessageTest(text: string) {
  await wait(3000);
  if (text.includes('fail')) { 
    throw new Error('send failed');
  }
}

const TestComponent = () => {
  const [messages, setMessages] = useState<TestMsg[]>([]);
  const [optMessages, addOptMessages] = useOptimistic(
    messages,
    (current, text: string) => [...current, { text, sending: true }],
  );

  const actionHandler = useCallback(
    async (formData: FormData) => {
      const messageInput = String(formData.get("messageInput") ?? "");
      addOptMessages(messageInput);
      await sendMessageTest(messageInput);
      startTransition(() => {
        setMessages((prev) => [...prev, { text: messageInput }]);
      });
    },
    [addOptMessages],
  );

  // Error in console: An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition.
  // ❌ DELIBERATE (Gotcha 4): logged, not thrown, and "random" never appears in the list.
  const buttonClick = () => {
    addOptMessages("random");
  };

  return (
    <>
      <ul>
        {optMessages.map((message, index) => (
          <li
            key={index}
          >{`${message.text}${message.sending ? " (sending...)" : ""}`}</li>
        ))}
      </ul>
      <form action={actionHandler}>
        <input
          type="text"
          id="messageInput"
          name="messageInput"
          required
          placeholder="Send a message..."
        />
        <button>Send</button>
      </form>
      <button onClick={buttonClick}>Click</button>
    </>
  );
}


export function OptimisticRoot() {
  return (
    <>
      <ErrorBoundary fallback={<p>Error occurred !</p>}>
        <TestComponent />
      </ErrorBoundary>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What does useOptimistic do?
      Shows a temporary value while an action runs, layered on top of the real state. When the
      action ends the layer is dropped and the real state shows through. (THE MODEL)

 ** Q2. How does it "roll back" on failure?
      It doesn't. The overlay is dropped when the action ends either way; on failure you simply
      never updated the real state, so the old value reappears. Measured [X*] -> []. (Gotcha 1)

 ** Q3. My item flashes and disappears even though the request succeeded. Why?
      The real state wasn't updated before the action finished. Update it inside the action,
      after the await. (Gotcha 1)

 ** Q4. Why wrap the post-await setState in startTransition?
      After an await React no longer knows it's in the action, so the update is urgent and
      commits first — with the optimistic update re-applied on top: [X, X*], then [X].
      startTransition batches it with the action finishing. (Gotcha 1)

 ** Q5. Two sends in a row — when does the first one stop saying "sending"?
      When the LAST overlapping action finishes. Measured: X done at 300ms stayed optimistic
      until Y finished at 1200ms, then both flipped in one render. (Gotcha 2)

 ** Q6. What happens if you call the updater outside an action?
      A console.error and the update is dropped — nothing is thrown. (Gotcha 4)

 ** Q7. Simple form or reducer form?
      Simple (`useOptimistic(value)`) for a single value like a like count; reducer form for
      lists, where you append or patch one item. (section 1)

 ** Q8. Can you send the optimistic value to the server?
      No — it may be about to disappear. Logic reads the real state; the optimistic value is
      for rendering only. (Gotcha 3)

 ** Q9. When is it the wrong tool?
      When a visible revert would be alarming (payments, bookings) — show pending instead.
      And when TanStack Query already owns the data: use its optimistic updates. (section 3)
 */

// 👉 NEXT: react-19-actions.tsx and use-form-status.tsx — the same action lifecycle seen from
//    the form owner (isPending, result state) and from a child (pending). useOptimistic is the
//    third view: what to SHOW while that action is in flight.
