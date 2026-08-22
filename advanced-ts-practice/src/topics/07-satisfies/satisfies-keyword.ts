
/**
  ** Satisfies
    It checks the value against a type but preserves specifics - literal keys and value types (doesn't replace the inferred type of the value). But annotation validates and widens.
    
 */ 

type Colors = Record<string, string | [number, number, number]>;

// Annotation
const palette: Colors = { red: '#ff0000', green: [0, 255, 0] }

const a: keyof typeof palette = 'blue'; // no error - the annotation replaced the inferred type, so keyof is `string`

// satisfies way
const palette1 = { red: '#ff0000', green: [0, 255, 0] } satisfies Colors;

const a1: keyof typeof palette1 = 'blue'; // error - keyof is 'red' | 'green', the inferred type was kept

/** 
  *? Question 1 - I don't see the satisfies preserves inferred type for [0, 255, 0], inferred type is - number[] but satisfies converted into tuple [number, number, number]
    Ans - satisfies provides context for inference, then keeps the inferred result instead of replacing it with target type.
    So the target type still steers inference (contextual typing), it just doesn't become the final type of the variable.
  *? Question 2 - what is meant by expression in syntax
    Ans - anything which produces a value i.e function call, variable, literal, an arithmetic operation

  *! Important nuance - "keeps literals" applies to KEYS always, but to VALUES only when the target type has literal types.
     typeof palette1 is { red: string; green: [number, number, number] } -> red is `string`, NOT '#ff0000',
     because the target `string | [number, number, number]` has no literal member to narrow to. Use `as const` if the exact value literal matters.
*/

// syntax - <expression> satisfies <type> (Not usable on declarations, parameters or return types)

// Validations happens in both directions
const palette2 = { red: '#ff0000', blue: 42 } satisfies Colors; // error TS2322 - value 42 is not string | [number, number, number]

type Cfg = { host: string; port: number };
const cfg1 = { host: 'q23' } satisfies Cfg; // error TS1360 - port is missing (satisfies needs the FULL shape, it is not Partial)

// Literal preservation
const r1 = { method: 'POST' }; // method: string   (mutable property, no context -> widened)
const r2 = { method: 'POST' } satisfies { method: 'POST' | 'GET' }; // method: 'POST'   (target has literals -> narrowed, then kept)
const r3 = { dimensions: [2, 3, 4] }; // dimensions: number[]
const r4 = { dimensions: [9, 0, 10] } satisfies { dimensions: [number, number, number] }; // dimensions: [number, number, number]
// r4 shows the two halves of satisfies: keys stay exact ('dimensions'), and the target shaped the value into a tuple.
// Values are NOT frozen to 9 | 0 | 10 - the target says `number`, so `number` is what inference lands on.

/**
  ** Comparision table
                                  validates             keep literals           makes readonly
    type annotations                 ✅                    ❌ widens                ❌
    as const                         ❌                    ✅                       ✅
    satisfies                        ✅                    ✅                       ❌
    as const satisfies               ✅                    ✅                       ✅

    "keep literals" = key literals always; value literals only if the target type contains literal types (see nuance above).
    `as const satisfies` is the only row that keeps value literals unconditionally - `as const` freezes them BEFORE satisfies validates.
*/

type Cfg1 = Record<string, string | number>;
// Annotations case
const cfg2: Cfg1 = { host: 'ada', port: 123 }; // validates
const cfg2Key: keyof typeof cfg2 = 'blue'; // no error - keyof is `string`, key literals were widened away
cfg2.host = 'dad'; // ok - not readonly

// as const
const cfg3 = { host: 'ada', port: 1212 } as const; // NO validation - a typo like `hostt` would pass silently
const cfg3Key: keyof typeof cfg3 = 'blue'; // error TS2322 - keys preserved as 'host' | 'port'
cfg3.host = 'asad'; // error TS2540 - readonly

// satisfies
const cfg4 = { host: 'int', port: 23 } satisfies Cfg1; // validates
const cfg4Key: keyof typeof cfg4 = 'blue'; // error TS2322 - keys preserved as 'host' | 'port'
cfg4.host = 'dad'; // ok - not readonly (and host is `string` here, so any string is accepted)

// as const satisfies - the usual best of both: validated AND fully literal
const cfg5 = { host: 'prod', port: 8080 } as const satisfies Cfg1; // validates
const cfg5Key: keyof typeof cfg5 = 'blue'; // error TS2322 - keys preserved as 'host' | 'port'
cfg5.host = 'dev'; // error TS2540 - readonly

// ** Gotcha - literal narrowing makes properties non-reassignable
const r = { method: 'GET' } satisfies { method: 'GET' | 'POST' };
r.method = 'POST'; // error TS2322 - method was narrowed to 'GET', so even the other valid union member is rejected.
                   // Annotate (`const r: { method: 'GET' | 'POST' }`) if you need to reassign later.

// ** Gotcha - satisfies doesn't make anything readonly
const cfg6 = { host: 'dev', port: 4201 } satisfies Cfg1;
cfg6.host = 'prod'; // ok - no error. satisfies only checks, it never freezes. Add `as const` for that.


// ** Gotcha - excess property checks still apply
const cfg7 = { host: 'dev', port: 4200 } satisfies { host: string }; // error TS2353 - 'port' is an excess property.
                                                                    // satisfies checks the object literal, so you cannot validate against a partial shape.

/**
  ** When not to use
     1. When you need the value to stay OPEN for change - the kept type is exact, so you can't reassign a property to another
        valid value (see the r.method gotcha) or add a new key later (cfg4.extra = 'x' -> TS2339). Annotate instead.
        NOTE: passing it downstream is fine - `use(cfg4)` where `use(c: Cfg1)` works, because the exact type is structurally assignable to Cfg1.
     2. on function parameters or return types - since satisfies is for expression level only; cant use it for parameter and return types; use annotation instead.
 */

