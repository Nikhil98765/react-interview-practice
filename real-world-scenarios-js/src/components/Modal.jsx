import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const Modal = ({ isOpen, onClose, returnFocusRef, children, title }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    /* 
      Hide the overflow of body and capture the value of it before making it hidden.
      focus on first element in the modal
      close modal if user press the escape key (keydown event)
      return method: 
        set the overflow of document.body to its previous value
        set back the focus to returnFocusRef
        remove the keydown event listener
    */

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const escapeListener = document.addEventListener('keydown', handleDown);
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusableElements[0].focus();

    return () => {
      document.removeEventListener('keydown', escapeListener);
      returnFocusRef.current?.focus();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, returnFocusRef]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="close-modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root'),
  );
};
