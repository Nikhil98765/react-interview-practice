import { Controlled } from "./components/form-handling/Controlled"
import { LazyLoadingExample } from "./components/LazyLoadingExample"
import { UnControlled } from "./components/form-handling/UnControlled"
import { Counter, DoubleFetch, FakeChatRoom } from "./components/strict-mode"
import { useState } from "react"


function App() {
  const [roomId, setRoomId] = useState(null);

  return (
    <>
      {/* <LazyLoadingExample /> */}
      {/* <Controlled></Controlled> */}
      {/* <UnControlled /> */}
      {/* <Counter /> */}
      {/* <DoubleFetch /> */}
      <div>
        <input type="text" id="room-id-input" placeholder="Enter Room Id ...." onChange={e => setRoomId(e.target.value)}/>
      </div>
      <FakeChatRoom roomId={roomId} />
    </>
  );
}

export default App
