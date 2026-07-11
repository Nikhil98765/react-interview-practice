
// function makeCounter() {
//   let count = 0;

//   return {
//     increment: () => ++count,
//     decrement: () => --count,
//     value: () => count
//   }
// }

// const counter = makeCounter();

// counter.increment();
// console.log("🚀 ~ counter.increment():", counter.value())
// counter.decrement();
// console.log("🚀 ~ counter.decrement():", counter.value())
// counter.value();
// console.log("🚀 ~ counter.value():", counter.value());

// console.log("Closure gotcha - 🔴 Using Var")
// for (var i = 0; i < 3; i++) {
//   setTimeout(() => console.log(i), 0);
// }

// console.log("Closure gotcha - 🟢 Using let")
// for (let i = 0; i < 3; i++) {
//   setTimeout(() => console.log(i), 0);
// }

// console.log("Closure gotcha - Pre ES6 way(IIFE)");
// for (var i = 0; i < 3; i++) {
//   (function (j) {
//     setTimeout(() => console.log(j), 0)
//   })(i)
// }


// function createMultiplier(multiplyFactor) {
//     return (value) => value * multiplyFactor
// }

// const double = createMultiplier(2);
// const result = double(10);
// console.log("🚀 ~ result:", result)

// const triple = createMultiplier(3);
// const result1 = triple(10);
// console.log("🚀 ~ result1:", result1)


// function memoization(fn) {
//   const cache = {};
//   return (value) => { 
//     const cachedResult = cache[value];
//     if (cachedResult) return cachedResult;
//     const result = fn(value);
//     cache[value] = result;
//     return result;
//   }
// }

// function add(a, b, c) {
//   return a + b + c;
// }

// //   curry(add)(1)(2)(3)  → 6
// //   curry(add)(1, 2)(3)  → 6
// //   curry(add)(1, 2, 3)  → 6

// function curry(fn) {
//   const fnArgumentsLength = fn.length;

//   function innerFn(...args) {
//     if (args.length === fnArgumentsLength) {
//       return fn(...args)
//     } else {
//       return (...moreArgs) => {
//         return innerFn(...args, ...moreArgs)
//       };
//     }
//   }

//   return innerFn;
// }

// curry(add)(1)(2)(3);
// const curryResult = curry(add)(1)(2)(3);

// console.log("🚀 ~ curryResult:", curryResult)

// const curryResult1 = curry(add)(1, 2)(3);
// console.log("🚀 ~ curryResult1:", curryResult1)

// const curryResult2 = curry(add)(1, 2, 3);
// console.log("🚀 ~ curryResult2:", curryResult2)

/*

1. How the prototype chain actually works (__proto__ vs prototype property — these trip people up)

when we create any object using the keyword new, constructor function's or object's __proto__ will be copied to newly created object's prototype chain.

2. Object.create() vs constructor functions vs ES6 class — what's actually happening under the hood with each
How new works step-by-step
  Object.create - creates a new object based on the existing object and copy its prototype chain.
  constructor function - creates a object using the new keyword, using this inside the constructor function will be bind to the object created.
  ES6 class - syntactic sugar over constructor function, uses class keyword to define and has a constructor to initialize the variable values on creation time and uses new keyword to create a new object. 

3. prototypal vs classical inheritance — why JS's model is fundamentally different

prototypal inheritance - allows inheritance from one single source (object or constructor function or class) [Doesn't support multiple inheritance]
classical inheritance - extends functionality from one class to another [Support multiple inheritance]

4. Where this shows up in interviews: polyfilling Object.create, explaining why arrow functions don't have their own prototype, or how class syntax is really just sugar over the prototype chain
*/


// function Person(name) {
//   this.name = name;
// }

// console.log("🚀 ~ Person.prototype:", Person.prototype)
// console.log("🚀 ~ Person.__proto__:", Person.__proto__)


// const p = new Person('Nikhil');
// console.log("🚀 ~ p.prototype:", p.prototype);
// console.log("🚀 ~ p.__proto__:", p.__proto__);

// // Polyfill
// function myNew(Constructor, args) {
//   const obj = {};
//   obj.__proto__ = Constructor.prototype;
//   const result = Constructor.apply(obj, args);
//   return (typeof result === 'object' && result !== null) ? result : obj;
// }


// const prototypeObject = {
//   speak() {
//     console.log("🚀 ~ Animal Speaks :", this.name);
//   }
// }

// const obj1 = Object.create(null);
// obj1.name = 'Test1';
// obj1.toString();
// console.log("🚀 ~ obj1:", obj1)

function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`🚀 ~ Animal with ${this.name} speaks`);
}

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype); // Dog.prototype.__proto__ = Animal.prototype (Inherits all props and methods from animal prototype)
Dog.prototype.constructor = Dog; // Set the constructor property in dogs prototype to itself, so that Dog instances i.e d.constructor will point to Dog but not to Animal


Dog.prototype.barks = function () {
  console.log(`🚀 ~ Dog with ${this.name} barks`);
}
console.log("🚀 ~ Dog.prototype:", Dog.prototype)

const d = new Dog('Tom', 'labrador');
// console.log("🚀 ~ d:", d)
// d.speak();
// d.barks();

// // new polyfill
// function myNew(Constructor, ...args) {
//   const obj = {};
//   obj.__proto__ = Constructor.prototype;
//   const result = Constructor.apply(obj, args);
//   return (typeof result === 'object' && result !== null) ? result : obj;
// }

// // Object.create polyfill
// function myObjectCreate(obj) {
//   const obj1 = {};
//   obj1.__proto__ = obj;
//   return obj1;
// }

// a instanceOf Dog => true (checks for Dog.prototype and finds it in a's prototype chain [a.__proto__])
function myInstanceOf(obj, Constructor) {
  let proto = obj.__proto__;
  const target = Constructor.prototype;

  while (proto !== null) {
    if (proto === target) return true;
    proto = proto.__proto__;
  }

  return false;
}

console.log("🚀 ~ myInstanceOf(d, Animal):", myInstanceOf(d, Dog))
