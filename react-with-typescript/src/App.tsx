import { useRef } from 'react'
import './App.css'
import { Input } from './components/Input'
import { List } from './components/List'

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const clickHandler = () => {
    console.log("🚀 ~ App ~ inputRef:", inputRef.current.value);
  }



  return (
    <>
      {/* <List
        items={[{ id: 1, name: 'test' }]}
        renderItem={(user) => <span>{user.name}</span>}
      /> */}
      <Input ref={inputRef} label='email' />
      <button onClick={clickHandler}>Click</button>
    </>
  )
}

export default App
