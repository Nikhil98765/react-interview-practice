// import './App.css'
import { CompoundComponent } from './compound-components/Toggle';
import Dashboard from './higher-order-components/Dashboard';
import RApp from './render-props/RApp';
import { CApp } from './render-props/CApp';


function App() {

  return (
    <>
      {/* <CompoundComponent />
      <Dashboard /> */}
      {/* <RApp></RApp> */}
      <CApp></CApp>
    </>
  );
}

export default App
