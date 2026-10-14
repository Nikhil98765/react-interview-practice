/* ============================================================================
   STANDALONE COMPONENTS — INTERVIEW REVISION SHEET  🎯
   ============================================================================
   HOW TO READ THIS FILE
     ✅ = verified behaviour           ❌ = broken / throws (the failure IS the lesson)
     ⚠️ = gotcha worth memorizing      💡 = interview takeaway
     📝 = predict the error BEFORE you try it
     `=> X` = actual compiler output from `ng build` on Angular 22.2.2 / TypeScript 6.0.3.
     Every error below was produced by making the mistake in a throwaway copy of this
     project and building it — nothing is quoted from memory.

   ▶️ nvm use && npm start, then open /01. (The Angular 22 CLI refuses this machine's default
      Node 22.20.0; .nvmrc pins 24.21.0.) To see an error: make the change, run `ng build`.

   FILES IN THIS FOLDER
     standalone-demo.ts .... this sheet + the demo component (route /01)
     standalone.route.ts ... the lazy child routes for /01
     standalone.module.ts .. a legacy NgModule, to show the two worlds mixing
     test1/2/3 ............. eager route, lazy route, NgModule-declared component

   CONTENTS
     1. The component ........... imports ARE the dependencies
     2. Bootstrap & providers ... where app-wide things go
     3. Mixing with NgModules ... what can be imported into what (measured)
     4. Lazy loading ............ loadComponent / loadChildren and the chunks they make
     5. Gotchas ................. 3 of yours + 3 more ⚠️
     6. When not to use
     7. Exercise
     8. Interview Q&A 🎤

   THE MODEL 🧠
     A standalone component carries its own compile-time scope: whatever its template
     uses must be in its `imports`. There is no module somewhere else quietly supplying
     DatePipe — if it isn't in the array, the template doesn't compile.
     The app follows the same idea one level up: `bootstrapApplication(App, appConfig)`
     replaces the root NgModule, and app-wide services are registered with provide*()
     functions in appConfig.

   💡 THE ONE-LINER: a standalone component's `imports` array is its complete list of
      dependencies — the compiler checks it, and the router can lazy-load the component
      on its own.
   ============================================================================ */

/**
  ** Standalone Components
     Components declare its own dependencies in imports and doesn't require an NgModule. App starts with bootstrapApplication and configures itself with provide*() functions. Default from v19. Less boilerplate, clearer dependencies and lazy loading per component.

     Problem it solves
      Previously with NgModule, component dependencies lives somewhere else, like import of DatePipe comes from other imported module. Hard to track down from which module the import comes. Standalone components solves this where dependencies should be imported in the import array of the component. standalone flag is true by default.

      app.config.ts => replaces app NgModule imports and providers
      lazy load each component without a module
      we can mix with deprecated NgModules in legacy code.
        1. can import Standalone components in imports array of NgModule
        2. can import NgModules in standalone component's imports array.
        3. standalone components can't be declared in NgModules declarations array, always in imports array.
      services of feature NgModule can be imported via importProvidersFrom(<module>.forRoot()) (bridges module based providers)
      feature modules can be imported directly in any components via imports array itself.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE COMPONENT — imports ARE the dependencies 🧩
// ─────────────────────────────────────────────────────────────────────────────
import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StandaloneModule } from './standalone.module';

@Component({
  selector: 'app-standalone-demo',
  // got this error if i removed DatePipe NG8004: No pipe found with name 'date' - To fix this, import the "DatePipe" class from "@angular/common" and add it to the "imports" array of the component.
  imports: [DatePipe, RouterLink, StandaloneModule], // no standalone: true needed
  // ✅ `standalone: true` is still ACCEPTED if you write it — it compiles with no warning,
  //    it's just redundant since v19.
  // ✅ StandaloneModule here is a legacy NgModule: importing it makes everything it EXPORTS
  //    (Test3Component) usable in this template. Measured: "I m from an NgModule" renders.

  // providers: [provideHttpClient()], // *! Error - TS2322: Type 'EnvironmentProviders' is not assignable to type 'Provider'. cant provide environment providers to component providers.
  // => ✅ confirmed: TS2322 exactly. importProvidersFrom(...) fails the same way (Gotcha 3).
  template: `
    <h2>01 Standalone</h2>
    <p>Loaded at {{ loadedAt() | date: 'medium' }}</p>
    <nav>
      <a routerLink="/">Home</a>
      <br />
      <a routerLink="/01/test1">Test 1</a>
      <br />
      <a routerLink="/01/test2">Test 2</a>
      <br />
      <standalone-test3 />
    </nav>
  `,
})
export class StandaloneDemo {
  loadedAt = signal(new Date());
  // 💡 A signal, not a plain field — in Angular 22 components default to OnPush (Gotcha 6),
  //    so a plain field mutated later would not re-render.
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOOTSTRAP & PROVIDERS — where app-wide things go 🚀
// ─────────────────────────────────────────────────────────────────────────────
/*
   src/main.ts          bootstrapApplication(App, appConfig)      <- from @angular/platform-browser
   src/app/app.config.ts
     providers: [
       provideBrowserGlobalErrorListeners(),
       provideRouter(routes),
       provideHttpClient(),        <- EnvironmentProviders: only valid HERE, not on a component
     ]

   Where a service lives decides how many copies exist:

     registered in                         instances                       lifetime
     ───────────────────────────────────────────────────────────────────────────────────
     @Injectable({ providedIn: 'root' })   ONE for the whole app            the app
     appConfig providers                   ONE (environment injector)       the app
     a component's `providers`             ONE PER COMPONENT INSTANCE,      destroyed with
                                           shared with its children         that component

   ✅ MEASURED (two hosts, each with providers: [ScopedService], each with a child):
        host ids [1, 2], child ids [1, 2]  -> one per host, children get their host's copy
        root service: the same instance everywhere
        removing both hosts -> ngOnDestroy ran on scoped 1 and 2
*/

// ─────────────────────────────────────────────────────────────────────────────
// 3. MIXING WITH NgModules — what can be imported into what 🔀
// ─────────────────────────────────────────────────────────────────────────────
/*
   ✅ ALL FIVE MEASURED with ng build:

     put…                                         into…                          result
     ──────────────────────────────────────────────────────────────────────────────────────
     an NgModule (StandaloneModule)               a standalone's `imports`       ✅ builds, renders
     a standalone component (Test1)               an NgModule's `imports`        ✅ builds
                                                  (and re-`exports` it)
     a standalone component                       an NgModule's `declarations`   ❌ NG6008 + NG6004
     an NgModule-DECLARED component (Test3)       a standalone's `imports`       ❌ NG2011
     provideHttpClient() / importProvidersFrom()  a component's `providers`      ❌ TS2322

   💡 The rule in one line: standalone things are IMPORTED everywhere; NgModule-declared
      components only travel inside their module.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 4. LAZY LOADING 💤  (see standalone.route.ts and app.routes.ts)
// ─────────────────────────────────────────────────────────────────────────────
/*
   app.routes.ts      { path: '01', loadChildren: () => import('./revision/01-standalone/standalone.route') }
   standalone.route.ts
     ''      loadComponent  -> StandaloneDemo
     'test1' component      -> Test1Component   (eager INSIDE an already-lazy file)
     'test2' loadComponent  -> Test2Component

   ✅ MEASURED — `ng build` lazy chunks:
        standalone-route   502 B   the routes file, WITH Test1 inside it
        standalone-demo   1.16 kB
        test2-component    310 B
   💡 So `component:` inside a lazy routes file isn't eager for the APP — it rides along in
      that file's chunk. Only `loadComponent` gives a component a chunk of its own.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOTCHAS ⚠️
// ─────────────────────────────────────────────────────────────────────────────

/**
  ** Gotcha 1 - Non standalone components in v19+
     standalone flag is set true by default. If some component is declared in NgModule, make sure standalone is set to false if not build fails. ng update takes care of this.

     ✅ MEASURED (test3.component.ts with the flag removed):
          NG6008: Component Test3Component is standalone, and cannot be declared in an NgModule.
                  Did you mean to import it instead?
          NG6004: Can't be exported from this NgModule, as it must be imported first
     ⚠️ It is a BUILD error (ng build / ng serve fail), not a runtime console error — the app
        never starts. And it comes in a pair: the `exports` entry fails too.
*/

/**
  ** Gotcha 2 - forgetting an import
     Each dependency needs to be imported in the component import array. Missing it would lead to NG8004 (missing pipe), NG8001 (for unknown elements).
     for built in control flows no import is needed.

     ✅ MEASURED:
          no DatePipe          => NG8004: No pipe found with name 'date'.
          <not-a-real-element> => NG8001: 'not-a-real-element' is not a known element
     💡 NG8001 suggests CUSTOM_ELEMENTS_SCHEMA — only right for genuine Web Components. For
        an Angular component it just hides the missing import.
*/

/**
  ** Gotcha 3 - component providers !== module providers
    providers in standalone components provides new instance for each component, App wide singletons go in providedIn: 'root' or in appConfig where u configure providers using provide*() exposed by other modules. Eg: provideHttpClient() returns environment providers which can be added only in app providers [in app.config]

    ✅ MEASURED: provideHttpClient() AND importProvidersFrom(...) in a component's providers
       both fail with TS2322: Type 'EnvironmentProviders' is not assignable to type 'Provider'.
       Per-instance scoping measured in section 2.
*/

/**
  ** Gotcha 4 - an NgModule-declared component can't be imported directly
     ✅ MEASURED: putting Test3Component itself into this component's `imports`:
          NG2011: The component 'Test3Component' appears in 'imports', but is not standalone
                  and cannot be imported directly.
     💡 Import the MODULE that declares and exports it (StandaloneModule here). This is the
        half of "they can coexist" that people get wrong in interviews.
*/

/**
  ** Gotcha 5 - an explicit `standalone: true` is not an error, just noise
     ✅ MEASURED: it compiles with no warning. Fine in code written for v15-v18; in v19+ the
        only value worth writing is `standalone: false`, and it means something.
*/

/**
  ** Gotcha 6 - Angular 22 components default to OnPush
     ✅ MEASURED: a component with no `changeDetection` set compiled with onPush = true.
        Mutating a plain field did NOT re-render it; the same toggle as a signal did.
     ⚠️ Not a standalone feature, but it's the other "default flipped" fact you'll be asked
        alongside Gotcha 1. Keep demo state in signals.
*/

/**
  *! When not to use
     1. Large legacy app when migrations wont pay off. currently, NgModules were still supported.
     2. A library which supports Angular v14 or older (since v14 has standalone feature in developer preview)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXERCISE 📝
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Exercise
      Build a two-route app with no NgModule:

      1. bootstrapApplication plus appConfig with provideRouter and provideHttpClient.
      2. Make one route lazy with loadComponent.
      3. Remove DatePipe from imports and check that you get NG8004.
      4. Declare a component in a dummy NgModule without standalone: false and note the error.

      ✅ ALL FOUR DONE AND VERIFIED in this project:
         1. src/main.ts + app.config.ts (provideRouter, provideHttpClient)
         2. '' and 'test2' use loadComponent — each got its own chunk (section 4)
         3. NG8004, exact text above
         4. NG6008 + NG6004 (Gotcha 1); test3.component.ts keeps standalone: false so it builds
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. INTERVIEW Q&A 🎤
// ─────────────────────────────────────────────────────────────────────────────
/**
  ** Interview Questions
      1. What problem do standalone components solve compared with NgModules?
          components can have dependencies and sometimes it can be imported through feature module import. Its very hard to track where the dependency came from and from which module import. so, standalone components solve this issue by including all the dependencies in import array of component and never from the feature modules and we can also lazy load this component.
      2. How do you bootstrap a standalone app, and where do the providers go?
          bootstrapApplication from platform-browser, providers go in the appConfig as a second argument in bootstrapApplication function.
      3. Can standalone components and NgModules coexist? In which direction can each be imported?
          yes, we can import NgModules in import array of standalone components and import standalone components in NgModule's import array. But if any component is declared in declarations array of NgModule, we need to explicitly set standalone to false in that component if not build fails when angular is v19 or newer.
          ✅ + the trap: a component DECLARED in an NgModule can't go straight into a standalone
             component's imports (NG2011) — import its module instead.
      4. What's the difference between providers on a standalone component and on an NgModule?
          standalone component provider - creates new instance per component and share it with child components and gets destroyed upon component destroy.
          NgModule provider - If module is eagerly loaded, the instances created using provider will be attached to environment injector and if lazily loaded then it goes into child injector. These were shared not created per instance.
          ✅ The component half is measured (section 2). The NgModule half matches the Angular
             docs but was not measured here.
      5. What is importProvidersFrom for?
          imports providers in standalone approach from modules which is based on NgModule.
          ✅ + it returns EnvironmentProviders, so it belongs in appConfig (or route providers),
             never in a component's providers (TS2322, measured).
      6. How would you migrate a large NgModule app?
           go by feature wise, convert -> remove modules -> switch to bootstrap
           ✅ That is exactly the official schematic's order. `ng generate @angular/core:standalone`
              (alias of standalone-migration) is run three times, once per mode, as listed in
              the installed schema: convert-to-standalone -> prune-ng-modules -> standalone-bootstrap.
*/

// 👉 NEXT: 02-control-flow — @if / @for / @switch, the built-ins that need NO entry in
//    `imports` (Gotcha 2's last line).
