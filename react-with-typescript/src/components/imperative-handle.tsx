/* ============================================================================
   REFS & IMPERATIVE APIs — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / wrong (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the output BEFORE you run it
     `// => X` = measured in real Chrome (headless, puppeteer-core) against this project's
     React 19.2.4 / @types/react 19.2.14. Type errors are from `tsc -p tsconfig.app.json --noEmit`.

   ▶️ npm run dev — App.tsx renders these one at a time (uncomment the one you want).
      npx tsc -p tsconfig.app.json --noEmit to see the type errors this sheet talks about.

   CONTENTS
     1. Why refs exist ............ the imperative escape hatch
     2. forwardRef vs React 19 .... ref is just a prop now (proved)
     3. useImperativeHandle ....... the contract you expose
     4. Gotchas ................... 5 of yours + 3 more ⚠️
     5. Ref callbacks ............. the three return shapes, measured
     6. When not to use
     7. Exercise: VideoPlayer
     8. Interview Q&A 🎤

   THE MODEL 🧠
     React is declarative: you describe state, React updates the DOM. A few things have no
     declarative expression — focus, scroll position, play/pause, measuring. There is no
     state that MEANS "focused". Those need the node itself, and a ref is how you get it.
     useImperativeHandle narrows what the parent gets: instead of the DOM node, it receives
     exactly the methods you chose to expose — an API contract, enforced by TypeScript.

   💡 THE ONE-LINER: props and state for what something IS; refs for what you want it to DO,
      once, now. `muted` is a prop; `seek(30)` is a command.
   ============================================================================ */

/**
 ** Ref's and imperative API's
 *
 * forwardRef - Lets a parent attach a ref to child's DOM node. In react < 19, ref prop is not forwarded to child comp by default. we need to make use of the forwardRef to forward.
 * useImperativeHandle - its an extension to forwardRef. Instead of exposing DOM node from child comp directly, we can expose an object of methods that will be attached to ref which parent sends and it exposes like an API contract for parent to its use cases. Like focusing on input etc...
 * In React 19, by default ref is sent as a normal prop to child. we still need to know about forwardRef since it still exists in older codebases.
 * Problem that it solves - React is declarative, describe state and react will update the dom. Few things like focusing an input, scrolling element into a view etc doesn't have declarative expressions. we can't define a state which means focus on the element. so, we need to go with imperative way which means we need to access the actual node and refs are solution for this.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef, type Ref } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 2. forwardRef vs REACT 19's ref-as-a-prop 🔀
// ─────────────────────────────────────────────────────────────────────────────

// * forwardRef — the pre-19 way. Still works in 19, and runs with NO deprecation warning ✅
const TextInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>((props, ref) => {
  return (
    <>
      <input type="text" {...props} ref={ref} />
    </>
  );
});
TextInput.displayName = "TextInput";

// ⚠️ A ref reaching THIS component proves nothing about React 19 — forwardRef would deliver it
//    in React 16 too. The version difference only shows on a component with NO forwardRef:
const PlainInput = (props: ComponentPropsWithoutRef<"input"> & { ref?: Ref<HTMLInputElement> }) => (
  <input type="text" {...props} />                    // ref is an ordinary prop, spread with the rest
);

export const Parent = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const plainRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("🚀 ~ forwardRef child  ~ ref.current:", inputRef.current?.tagName);
    console.log("🚀 ~ plain fn child    ~ ref.current:", plainRef.current?.tagName);
  }, []);
  // => forwardRef child: "INPUT"   plain fn child: "INPUT" ✅ MEASURED on React 19.
  //    On React 18 the second one would be null + a "Function components cannot be given refs" warning.
  //    THAT is the proof; the forwardRef one is the control.

  return (
    <>
      <button onClick={() => inputRef.current?.focus()}>Focus forwardRef input</button>
      <button onClick={() => plainRef.current?.focus()}>Focus plain input</button>
      <TextInput ref={inputRef} />
      <PlainInput ref={plainRef} />
    </>
  );
};
// 💡 Interview framing: forwardRef isn't "how refs work", it's a workaround for refs NOT being
//    a prop. React 19 made ref a real prop and deprecated forwardRef — but every codebase older
//    than 2024 is full of it, so you read both.

// ─────────────────────────────────────────────────────────────────────────────
// 3. useImperativeHandle — THE CONTRACT 📜
// ─────────────────────────────────────────────────────────────────────────────
// ** useImperativeHandle, not changed in react 19.

type InputHandle = { focus: () => void; clear: () => void };

// ⚠️ ComponentPropsWithoutRef, not ...WithRef: the ref here is an InputHandle, not an
//    HTMLInputElement, so pulling the input's own ref type into the props is wrong.
const TextInput1 = forwardRef<InputHandle, ComponentPropsWithoutRef<"input">>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // now ref from parent will have access to only methods in the return object
  useImperativeHandle(ref, () => {
    return {
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
    };
  }, []);

  return (
    <>
      <input type="text" {...props} ref={inputRef} />
    </>
  );
});
TextInput1.displayName = "TextInput1";

export const Parent1 = () => {
  const inputRef = useRef<InputHandle>(null);

  function handleFocus() {
    inputRef.current?.focus();
    // @ts-expect-error — THE POINT: Property 'value' does not exist on type 'InputHandle' (TS2339).
    console.log("🚀 ~ handleFocus ~ inputRef.current?.value:", inputRef.current?.value); // undefined
    console.log("🚀 ~ what the parent CAN see:", Object.keys(inputRef.current ?? {}));
  }
  // => MEASURED: Object.keys(ref.current) -> ['focus', 'clear'] · ref.current.value -> undefined
  //    and document.activeElement is the input after focus() ✅
  // 💡 In JS this is a runtime surprise; in TS it's a COMPILE error. That's the whole argument
  //    for typing the handle: the contract is checked at the call site.

  return (
    <>
      <button onClick={handleFocus}>Focus on Input</button>
      <TextInput1 ref={inputRef} />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
 ** Gotcha 1 - dependency array is real
    useImperativeHandle(ref, factory, deps) works like useMemo. 
    1. Omit deps then handle object is built on every render. 
    2. assign [] to deps, then it will be built once. If it touches only refs then this options is fine.
    3. If we have any dependency on any state variable, handle method needs to be built every time with a new value of state variable. add it as a dependency.

    ✅ MEASURED with a handle method that returns a prop, prop changed 1 -> 2:
         deps []     -> method still returns 1   (stale closure)
         deps [prop] -> method returns 2         ✅
    💡 Rule of thumb: methods that only touch refs can use []; anything closing over props or
       state needs those in deps — the same rule as useCallback, for the same reason.
 */

/**
 ** Gotcha 2 - Don't reach for refs where state works.
    modal open / close work as state instead of imperatively calling open / close methods.
 */

/**
 ** Gotcha 3 - ref callbacks and react 19 cleanup change
    Before react 19, ref callbacks doesn't have the cleanup method, react sends the node when element got attached to DOM and when element is unmounted, node value is sent as null, we can handle that inside the cb by having null check but we can't access node for cleanup. so, we need to stash the node somewhere outside it. But in react 19, callback return method works as a cleanup method and react calls it when element is unmounted instead of sending null, this way node is still accessible in cleanup through closure.
    ** inline ref callbacks will be recreated on every re-render. react checks for previous and current callback reference and find its different for inline functions. so better outsource it to a function wrapped with a useCallback, this way function will have same reference between renders.

    ✅ Both halves verified — the measurements are in section 5.
 */

const observer = new ResizeObserver(() => { });
// let savedNode: HTMLDivElement;

export const RefExample = () => {
  const divRef = (node: HTMLDivElement) => {
    console.log("🚀 ~ RefExample ~ node:", node)
    // if (node) {
    //   observer.observe(node);
    //   savedNode = node; // stashing the node outside the comp scope, so that i can use it for unobserve (before react 19 approach)
    // } else {
    //   observer.unobserve(savedNode);
    // }
    observer.observe(node);
    return () => { // In react 19, return method is the cleanup method for useRef instead of a null check and no more stashing of node outside the comp scope.
      console.log("🚀 ~ RefExample ~ unobserve:", node)
      observer.unobserve(node);
    }
  };
  // => MEASURED: mount -> observe once; unmount -> unobserve once, with `node` still in scope ✅
  //    Because a cleanup is returned, React NEVER calls this with null (section 5).
  // ⚠️ This inline callback is recreated every render, so every re-render tears down and
  //    re-attaches the observer. Harmless here, wasteful in a list — wrap it in useCallback.

  return (
    <div ref={divRef}>
      Hi
    </div>
  )
}

/**
 ** Gotcha 4 - refs don't trigger re-renders
    Useful for values that persists across renders.

    ⚠️ The flip side: because they don't re-render, a value the UI must SHOW cannot live in a
       ref. Timers, previous values, "has this already run", observers, the DOM node itself —
       refs. Anything rendered — state.
 */

/**
 ** Gotcha 5 - refs are attached before effects, not during render
   Refs are attached after the commit phase, after react writes to DOM which is before useLayoutEffect and useEffect runs.
 */
export const RefsAttachExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line react-hooks/refs -- demonstrating the null, see the note below
  console.log("🚀 ~ render body ~ inputRef.current:", inputRef.current);   // => null ✅
  // ⚠️ Log .current, not the ref OBJECT: DevTools shows the object's LIVE contents, so
  //    console.log(inputRef) appears to already hold the node and hides the whole point.
  // ⚠️ ESLint refuses this line in real code (react-hooks/refs: "Cannot access refs during
  //    render"). That is the rule stating Gotcha 5 from the other side: during render the value
  //    is not there yet, and reading it makes the render depend on something React may change
  //    without re-rendering. Reading refs belongs in effects and event handlers.

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ inputRef.current:", inputRef.current?.tagName); // => "INPUT" ✅
  }, []);

  return (
    <>
      <input type="text" ref={inputRef} />
    </>
  )
}

/* ---- 4.6 ⚠️ A ref is not a channel for reading child state ------------------ */
// Exposing getValue() on a handle makes the parent poll. Data flows DOWN as props and UP via
// callbacks; refs are for commands that have no value to report.

/* ---- 4.7 ⚠️ The handle is an API commitment -------------------------------- */
// Every method you expose is something the parent may now depend on, and removing one is a
// breaking change. Expose the smallest set that the use case needs.

/* ---- 4.8 ⚠️ ref.current is `T | null` and TypeScript means it -------------- */
// useRef<HTMLInputElement>(null) gives RefObject<HTMLInputElement | null>, so every access
// needs `?.` or a narrowing check — App.tsx has exactly this error today:
//   error TS18047: 'inputRef.current' is possibly 'null'
// The null isn't paranoia: it IS null during render, and again after unmount.

/**
 ** Angular parallel
    forwardRef + useImperativeHandle is nothing but @ViewChild and a public method in a child component in angular. @ViewChild gives back the child component instance and only public methods can be accessible by parent. There is no parallel for forwardRef in angular but the actual forwardRef in angular is used to solve circular DI issues.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 5. REF CALLBACKS — the three return shapes 🪝
// ─────────────────────────────────────────────────────────────────────────────
/*
   Same component, three refs, one re-render. MEASURED (React 19.2.4):

     what the callback returns      on mount        on RE-RENDER (inline, new identity)
     ─────────────────────────────────────────────────────────────────────────────────
     nothing (undefined)            called(node)    called(null) -> called(node)      2 calls
     a cleanup function             called(node)    cleanup()    -> called(node)      node never null
     a non-function (e.g. `node`)   called(node)    called(null) -> called(node)      silently ignored

   ✅ So "the inline callback fires twice per render" is really: React detaches then reattaches
      because the function identity changed. WITH a cleanup you get cleanup+attach; WITHOUT one
      you get the legacy null-then-node protocol.
   ❌ Returning a non-function (like `return node`) doesn't just do nothing — it costs you the
      cleanup and drops you back to the null protocol, with NO React warning. Silent.
   ✅ A useCallback'd ref with [] deps was called ONCE on mount and not again after a re-render.
   ⚠️ Reading the real console: main.tsx wraps the app in <StrictMode>, so MOUNT already shows
      attach -> detach -> attach for every ref (measured: inline logged node, null, node before
      you touch anything). Count from the re-render onwards, not from page load.
*/

export const RefCallback = () => {

  const handleRefCb = useCallback(function (node: HTMLDivElement | null) {
    console.log("🚀 ~ handleRefCb ~ node:", node);
    // ❌ was `return node;` — a non-function return is silently ignored and disables cleanup.
    return () => console.log("🚀 ~ handleRefCb ~ cleanup for:", node);
  }, []);

  const [count, setCount] = useState(0);

  return (
    <>
      {/* 📝 predict: how many times does each log on ONE click of the counter? */}
      <div ref={node => { console.log(`🚀 inline ref cb has been called: ${node}`) }}>ref 1 DIV</div>
      {/* => twice per re-render: once with null, once with the node (no cleanup returned) */}
      <div ref={handleRefCb}>ref 2 DIV</div>
      {/* => once on mount, then never again — stable identity, nothing to re-attach */}
      <button onClick={() => setCount(prev => prev + 1)}>Counter: {count }</button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHEN NOT TO USE ❌
// ─────────────────────────────────────────────────────────────────────────────
  /**
   * ! When not to use 
   * 1. when props and state express it.
   * 2. when you expose handle for parent to read child state, better pass a callback up for data flow and refs are for imperative commands.
   * 3. exposing a handle is an API commitment, so don't add a casual method on the handle while component is still in design.
   */

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXERCISE — VideoPlayer 🎬
// ─────────────────────────────────────────────────────────────────────────────
/**
 **Exercise

  Build a <VideoPlayer> that exposes play(), pause() and seek(seconds) to its parent, and nothing else.

  Prove four things:

  1. The drop. Pass a ref to a plain function component without forwardRef (use a React 18-style wrapper if your project is on 19, or just observe the React 19 behavior and note the difference). Confirm ref.current is null or the node, depending on version — and know which you're on.
  2. The contract. With useImperativeHandle, confirm ref.current.play() works and ref.current.currentTime is undefined. The parent has no access to the <video> element.
  3. The stale closure. Give the handle a method that reads a prop, pass [] as deps, change the prop, and confirm the method still uses the old value. Then fix it with the right deps.
  4. Command vs state. Add a muted prop as declarative state alongside the imperative methods, and articulate in a comment why muted is a prop but seek is a method.

  Then write a second component using a ref callback with an IntersectionObserver, and confirm what happens to the callback on re-render when the arrow function is inline versus wrapped in useCallback.

  ✅ ALL FOUR MEASURED on React 19.2.4:
     1. plain fn component, no forwardRef -> ref.current = INPUT (section 2). React 18 would give null.
     2. Object.keys(ref.current) -> ['play','pause','seek','testMethod']; ref.current.currentTime
        -> undefined, and in TS it doesn't even compile.
     3. deps [] -> method kept returning the first prop value; deps [prop1] -> latest ✅
     4. see the comment on isMuted below.
 */

type VideoPlayerHandle = {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  testMethod: () => void
};

export const ExerciseParent = () => {
  const childRef = useRef<VideoPlayerHandle>(null);
  const [prop1, setProp1] = useState(1);
  const [isMuted, setIsMuted] = useState(false); // muted will be a prop which depicts the state of the video whereas seek is a command which takes seconds as input and set the currentTime to input. If we expose currentTime as prop to parent, it can send input of 30 seconds and video stays at 30 seconds which is not we want. If it is repetitive and meaningful like seek command choose useImperative and expose as a method to parent and if it is repetitive but meaningless then define it as a prop.
  // 💡 Sharper version of the same rule: `muted` is a STATE the UI should always reflect — if
  //    React re-renders, muted must still be true. `seek(30)` is an EVENT that happens once and
  //    is then over; storing "currentTime: 30" as state would fight the video's own playback.

  useEffect(() => {
    console.log("🚀 ~ ExerciseParent ~ handle keys:", Object.keys(childRef.current ?? {}));
    // => ['play', 'pause', 'seek', 'testMethod'] ✅ no currentTime, no DOM node
  }, []);

  function changeProp1() {
    setProp1(Math.random());
  }

  return (
    <>
      <VideoPlayer ref={childRef} prop1={prop1} muted={isMuted} />
      <button onClick={() => childRef.current?.play()}>Play</button>
      <button onClick={() => childRef.current?.pause()}>Pause</button>
      <button onClick={() => childRef.current?.seek(50)}>Jump to 50s</button>
      <button onClick={changeProp1}>Change prop value</button>
      <button onClick={() => childRef.current?.testMethod()}>Current prop value in child component</button>
      {/* 4. the declarative half, right next to the imperative one */}
      <button onClick={() => setIsMuted(m => !m)}>{isMuted ? "Unmute" : "Mute"} (prop, not a command)</button>
    </>
  )
}

const VideoPlayer = forwardRef<VideoPlayerHandle, {prop1: number, muted: boolean}>(({ prop1, muted }, ref) => {
  console.log("🚀 ~ prop1:", prop1)
  const videoRef = useRef<HTMLVideoElement>(null);

  // console.log("🚀 ~ VideoPlayer ~ ref:", ref) // {current: 0}, since project is in react 19, ref can accessed as a ordinary prop.

  useImperativeHandle(ref, () => {
    return {
      play: () => videoRef.current?.play().catch(err => console.warn(`⚠️ play blocked: ${err.name}`)),
      pause: () => videoRef.current?.pause(),
      seek: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      },
      testMethod: () => {
        console.log("🚀 ~ prop1:", prop1) // with empty deps, it always returns 1. Once we added the prop in deps, its logging the latest value.
      }
    }
  }, [prop1]);
  // ⚠️ play() returns a promise that REJECTS on autoplay policy ("NotAllowedError") — the catch
  //    above is not optional, or every blocked play is an unhandled rejection.

  return (
    <video id='video' ref={videoRef} muted={muted} controls preload='none' width="600" poster="https://assets.codepen.io/32795/poster.png">
      <source id='mp4' src="http://media.w3.org/2010/05/sintel/trailer.mp4" type='video/mp4' />
      <source id='webm' src="http://media.w3.org/2010/05/sintel/trailer.webm" type='video/webm' />
      <source id='ogv' src="http://media.w3.org/2010/05/sintel/trailer.ogv" type='video/ogg' />

      <track kind="subtitles" label="English subtitles" src="subtitles_en.vtt" srcLang="en" default>
      </track>
      <track kind="subtitles" label="Deutsche Untertitel" src="subtitles_de.vtt" srcLang="de">
      </track>
      <p>Your user agent does not support the HTML5 Video element.</p>
    </video>
  );
});
VideoPlayer.displayName = "VideoPlayer";

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
 ** Q1. What problem do refs solve?
      The imperative gaps: focus, scroll, play/pause, measure. There's no state that means
      "focused", so you need the node. (section 1)

 ** Q2. What changed in React 19?
      ref is an ordinary prop, so forwardRef is no longer needed (and is deprecated, though it
      still works with no runtime warning). Proof needs a component WITHOUT forwardRef: on 19
      its ref.current is the node; on 18 it's null plus a warning. (section 2)

 ** Q3. Why useImperativeHandle instead of handing over the DOM node?
      It narrows the surface to the methods you chose. Measured: the parent sees exactly
      ['focus','clear'] and ref.current.value is undefined — a compile error in TS. (section 3)

 ** Q4. What are the deps for?
      Same as useMemo: when to rebuild the handle. Methods closing over props/state need them
      in deps or they capture stale values — measured 1 vs 2 after a prop change. (Gotcha 1)

 ** Q5. When is ref.current populated?
      After commit, before either effect. It's null in the render body and a node inside
      useEffect / useLayoutEffect. (Gotcha 5)

 ** Q6. Why does my inline ref callback fire twice per render?
      Its identity changes, so React detaches and reattaches. Without a returned cleanup you
      get called(null) then called(node); with one you get cleanup() then called(node).
      useCallback with stable deps stops it entirely. (section 5)

 ** Q7. What's the React 19 ref-callback cleanup for?
      The node stays in the closure, so you can unobserve/unsubscribe the exact node instead of
      stashing it in a module variable for the null call. Returning a NON-function silently
      disables it. (Gotcha 3, section 5)

 ** Q8. Refs vs state — how do you decide?
      Does the UI need to show it? State. Is it a one-off command or a value that must survive
      renders without causing one? Ref. `muted` is a prop, `seek(30)` is a method. (section 7)
 */

// 👉 NEXT: hooks-practice/src/components/use-layout-effect.jsx — refs are how you MEASURE;
//    that sheet is about WHEN you're allowed to (before paint), and why its Gotcha 3 says refs
//    are already populated in both effects.
