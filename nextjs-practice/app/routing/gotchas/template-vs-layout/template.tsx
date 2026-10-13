/* template.tsx gets a new key when its segment changes, so everything inside REMOUNTS:
   client state resets, effects re-run, DOM is recreated. Use it when you want that. */

import { LabelledCounter } from "./labelled-counter";

const DemoTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="demo-box">
      <span className="tag">template.tsx — remounted on navigation</span>
      <LabelledCounter label="template counter" />
      {children}
    </div>
  );
};

export default DemoTemplate;
