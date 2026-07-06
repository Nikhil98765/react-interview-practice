
function makeCounter() {
  let count = 0;

  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count
  }
}

const counter = makeCounter();

counter.increment();
console.log("🚀 ~ counter.increment():", counter.value())
counter.decrement();
console.log("🚀 ~ counter.decrement():", counter.value())
counter.value();
console.log("🚀 ~ counter.value():", counter.value());

console.log("Closure gotcha - 🔴 Using Var")
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

console.log("Closure gotcha - 🟢 Using let")
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

console.log("Closure gotcha - Pre ES6 way(IIFE)");
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0)
  })(i)
}


function createMultiplier(multiplyFactor) {
    return (value) => value * multiplyFactor
}

const double = createMultiplier(2);
const result = double(10);
console.log("🚀 ~ result:", result)

const triple = createMultiplier(3);
const result1 = triple(10);
console.log("🚀 ~ result1:", result1)


function memoization(fn) {
  const cache = {};
  return (value) => { 
    const cachedResult = cache[value];
    if (cachedResult) return cachedResult;
    const result = fn(value);
    cache[value] = result;
    return result;
  }
}

function add(a, b, c) {
  return a + b + c;
}

//   curry(add)(1)(2)(3)  → 6
//   curry(add)(1, 2)(3)  → 6
//   curry(add)(1, 2, 3)  → 6

function curry(fn) {
  const fnArgumentsLength = fn.length;

  function innerFn(...args) {
    if (args.length === fnArgumentsLength) {
      return fn(...args)
    } else {
      return (...moreArgs) => {
        return innerFn(...args, ...moreArgs)
      };
    }
  }

  return innerFn;
}

curry(add)(1)(2)(3);
const curryResult = curry(add)(1)(2)(3);

console.log("🚀 ~ curryResult:", curryResult)

const curryResult1 = curry(add)(1, 2)(3);
console.log("🚀 ~ curryResult1:", curryResult1)

const curryResult2 = curry(add)(1, 2, 3);
console.log("🚀 ~ curryResult2:", curryResult2)


/*
1. Not removing the event listeners which were attached during useEffect. If we don't remove the reference to computeSize fn, GC marks it and will be alive and stored in heap memory.
  Fix: 
    useEffect(() => {
      window.addEventListener('hover', computeSize);
      return () => window.removeEventListener('hover', computeSize);
      }, []);

  2. Not clearing timeout's created using setTimeout which were created in useEffect()
    Fix: 
      useEffect(() => {
        const timer = setTimeout(() => fn(), delay);
        return () => clearTimeout(timer);
      }, [])

      Note: same goes for setInterval as well or any other web API.
  3. closures holding large objects.
    Fix: 
      function createArray() {
        const arr = Array.from(() => 1, { length: 100000 });
        const arrLength = arr.length;

        return {
          length: () => arrLength // instead of arr.length -> GC wont mark this array because its still getting referenced in this function due to closure.
        }
      } 
  4. Referencing detached DOM nodes.
    Fix: 
      let element;

      function updateDOM() {
        const divEle = document.createElement('div');
        element = divEle; // Don't reference the DOM nodes to outer variables. 
        body.appendChild(divEle);
        body.removeChild(divEle);
      }
*/
