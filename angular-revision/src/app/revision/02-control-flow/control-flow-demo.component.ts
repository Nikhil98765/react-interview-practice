/**
  ** Built in control flow
      @if, @for, @switch were template syntax that were built into compiler, replacing the directives *ngIf, *ngFor, *ngSwitch from v17. Now, you don't need to import the commonModule in order to use them and is more type safe. else is more readable now. @for makes track mandatory, so you can't forget DOM reuse. older directives have been deprecated in v20.
*/

/**
  ** Gotcha 1 - track $index on dynamic list
      If items were added/removed/reordered, DOM stays attached to the positions but not to the data. so input values, focus, animations might end up on the wrong node. use $index only for the static lists.
*/

/**
  ** Gotcha 2 - track item (object identity)
      track by item checks the item by reference using ===, if reference got changed it will destroy and recreate the DOM nodes again. Track by a stable id. If no track is provided in older syntax, it still tracks by item.
*/

/**
  ** Gotcha 3 - duplicate track keys will show a warning
     If duplicate track keys were present in data, then upon re-render it will show the warning in console but not on first render. Due to this sometimes, DOM updates will go wrong.

     ✅ MEASURED: NG0955 "The provided track expression resulted in duplicated keys" on the first update, nothing on first render, and nothing in a production build (dev-mode only).
     ⚠️ Related: tracking by identity after a re-fetch logs NG0956 "(track by identity) caused re-creation of the entire collection".
*/

/**
  ** Gotcha 4 - mutating the array in place doesn't notify the signal
     this.orders.set(this.orders().reverse()) reverses the same array and sets the same reference, so the signal sees no change (Object.is).
     ✅ MEASURED: a computed() reading orders()[0] stayed stale after the in-place reverse, and re-ran with [...orders()].reverse().
     ⚠️ The DOM may still update when it's triggered by a click, because the event re-checks the component. Don't rely on it; always set a new array.
*/

/**
  *! When not to use
      old codebase where migration is not possible. older control directives were still supported.
*/

/**
  **🎤 Interview questions
      1. Why did Angular move from structural directives to built-in control flow?
          Less boilerplate code, no need to import commonModule now, new syntax is built in to the compiler.
            Improvements:
              more type safe, 
              else is more readable now(no need of extra ng-template for else condition), 
              empty state for for, 
              mandatory trackBy for for
      2. Why is track mandatory in @for? What happens if you track by $index or by object identity?
          Previously, track is optional and still track works by object identity, so any API re-fetch changes data and new references came in, it would then re-create the whole DOM nodes again.
          $index - tracks by position, so DOM nodes won't change. input values,focus, animations wont change and would end up on wrong node. only re-bindings happen.
          tracks by object identity -  checks by reference, if object reference is changed DOM nodes will be recreated again.
      3. What contextual variables does @for give you?
          $index - position, 
          $count- length of the list, 
          $odd - boolean if index is odd
          $even - boolean, if index is even
          $first - boolean, true if item is first in the list.
          $last - boolean, true of item is last in the list.
      4. How does @switch compare values? Does it fall through?
          it compares with ===; it doesn't fall through, no need to add break
      5. What is @empty for?
          fallback for empty list in @for.
      6. What’s a pitfall of @if (value; as alias)?
          If value is falsy, it skips rendering the block and renders else.
      7. How would you migrate a project to control flow ?
          ng g @angular/core:control-flow
          convert -> remove CommonModule import, go by component and feature wise.
*/

/**
  ** Exercise

    Build an orders list with a signal of { id, status, note } objects and buttons for Add, Remove first and Shuffle:

    1. Render it with @for and @empty, showing $index, $count and the “latest” marker.
    2. Put an <input> in each row and type something into row 2.
    3. Shuffle with track $index: your text stays in row 2 and lands on the wrong order. ❌
    4. Shuffle with track o.id: your text moves with its order. ✅
    5. Show each status with @switch.
    6. Use @if with as on a selected() signal, plus @else.
    7. Write support@shop.com in the template as plain text and fix the error with &#64;.

    ⚠️ Step 2: with 3 orders, reversing leaves row 2 in place, so both trackings look the same. Type into row 1 (or use 4+ orders).
    ⚠️ Step 7: in Angular 22 support@shop.com compiles fine. @ only breaks when the next word is a block keyword:
         support@if.com -> NG5002: Incomplete block "if". If you meant to write the @ character, you should use the "&#64;" HTML entity instead.
       A literal { or } in text always breaks (NG5002, use &#123; / &#125;).
*/


import { Component, signal } from "@angular/core";
// For the commented-out *ngIf / *ngFor / user$ demos, uncomment these and add CommonModule to imports:
// import { CommonModule } from "@angular/common";
// import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  templateUrl: './control-flow-demo.component.html',
  imports: [],
})
export class ControlFlowDemo {
  // user$ = toObservable(signal({ id: 1, name: 'Test' }));
  // orders = signal([
  //   {
  //     id: 30,
  //     name: 'paid',
  //   },
  //   {
  //     id: 30,
  //     name: 'pending',
  //   },
  //   {
  //     id: 50,
  //     name: 'shipped',
  //   },
  // ]);
  // loggedIn = signal(false);
  selected = signal<{ id: string; name: string } | null>(null);

  // clear() {
  //   this.orders.set([]);
  // }

  // shuffle() {
  //   this.orders.set(this.orders().reverse());
  // }

  orders = signal<{ id: number; status: string; note: string }[]>([
    {
      id: 32,
      status: 'pending',
      note: 'payment is still pending'
    },
    {
      id: 21,
      status: 'completed',
      note: 'order is completed'
    },
    {
      id: 1,
      status: 'shipped',
      note: 'order is shipped'
    }
  ]);
}

