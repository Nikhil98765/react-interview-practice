export const insertAtBeginning = <T>(arr: T[], value: T) => {
  const newArray = [value, ...arr];
  return newArray;
}

const result = insertAtBeginning([1, 2, 3], -1);

const result1 = insertAtBeginning(['1', '2', '3'], '-1');