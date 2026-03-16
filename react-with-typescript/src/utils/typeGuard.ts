interface User {
  id: number;
  email: string;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value && 
    'email' in value
  )
}

const data: unknown = { test: '' };

if (isUser(data)) {
  const email = data.email;
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('Not a string'); 
}

function process(value: unknown) {
  assertIsString(value);
  value.toUpperCase();
}