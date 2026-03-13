import { useState } from "react"

export const useToggle = (initial: boolean): [value: boolean, toggle: () => void] => {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);

  return [value, toggle];
}

