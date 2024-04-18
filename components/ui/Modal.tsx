import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-200 p-5 rounded-lg max-w-lg w-full">
        <button onClick={onClose} className="float-right">✕</button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;