import './App.css'
import { List } from './components/List'

function App() {

  return (
    <>
      <List
        items={[{ id: 1, name: 'test' }]}
        renderItem={(user) => <span>{user.name}</span>}
      />
    </>
  )
}

export default App
