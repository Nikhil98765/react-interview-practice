
import React, { useRef, useState } from 'react'
import { Modal } from './Modal';

export const PortalsPage = () => {

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  return (
    <div className='app'>
      <h1>React Portal Modal</h1>
      <button onClick={() => setIsOpen(true)} ref={buttonRef}>
        Open Modal
      </button>
      <Modal
        isOpen={isOpen}
        returnFocusRef={buttonRef}
        onClose={() => setIsOpen(false)}
        title='Delete Project'
      >
        <p>Are you sure you want to delete this project ?</p>
        <div className='actions'>
          <button className='secondary' onClick={() => setIsOpen(false)}>Cancel</button>
          <button className='danger' onClick={() => {
            alert('Deleted');
            setIsOpen(false);
          }}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
