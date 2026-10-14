import { Component } from "@angular/core";

/**
  ** An NgModule-declared component (see standalone.module.ts).
     `standalone: false` is REQUIRED here: since v19 every component is standalone unless it
     says otherwise, and a standalone component can't sit in `declarations`.
     Remove the flag and `ng build` fails — a BUILD error, the app never starts:
       NG6008: Component Test3Component is standalone, and cannot be declared in an NgModule. Did you mean to import it instead?
       NG6004: Can't be exported from this NgModule, as it must be imported first
     And it can't go straight into a standalone component's `imports` either (NG2011) —
     standalone-demo.ts gets it by importing StandaloneModule.
*/
@Component({
  template: '<h2>I m from an NgModule</h2>',
  selector: 'standalone-test3',
  standalone: false
})
export class Test3Component{

}
