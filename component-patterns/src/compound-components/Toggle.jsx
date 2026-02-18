import { createContext, useContext, useState } from "react";

const ToggleContext = createContext();

export const Toggle = ({ children }) => {
  const [on, setOn] = useState(false);
  const ctxValue = {
    on,
    toggle: () => setOn(!on)
  }

  return <ToggleContext.Provider value={ctxValue}>{children}</ToggleContext.Provider>
}

Toggle.On = function ToggleOn({ children }) {
  const { on } = useContext(ToggleContext);
  return (
    <>{on ? children: null }</>
  );
}

Toggle.Off = function ToggleOff({ children }) {
  const { on } = useContext(ToggleContext);
  return (
    <>{ on ? null: children }</>
  )
}

Toggle.Button = function ToggleButton({ children, props }) {
  const { toggle } = useContext(ToggleContext);
  return (
    <button onClick={toggle} {...props}>{children}</button>
  )
}

export const CompoundComponent = () => {
  return (
    <Toggle>
      <Toggle.On>The button is on</Toggle.On>
      <Toggle.Off>The button is off</Toggle.Off>
      <Toggle.Button>Toggle</Toggle.Button>
    </Toggle>
  );
}



