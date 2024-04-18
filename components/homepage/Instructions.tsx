'use client'

import Image from 'next/image';
import { useState } from 'react';
import Modal from '../ui/Modal';

const data = [
  {
    title: 'Sign up',
    description: 'Start by signing up for free',
    image: '/pen.png',
  },
  {
    title: 'Upload a document',
    description: 'After login, upload your document and let Camelot AI analyze it',
    image: '/upload.png',
  },
  {
    title: 'Begin Chat',
    description: 'Simply start asking Camelot any question about the document!',
    image: '/chat.png',
  },
];

const Instructions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div 
      id="how-it-works" 
      className="container flex justify-center"
    >
      <button onClick={openModal} className="flex bg_linear rounded-full sm:px-5 px-12 py-[2.5px] sm:py-2 text-white text-center text-lg sm:text-[15px] font-small leading-[37px] tracking-[-0.3px]">
        How Does It Work?
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center mb-6 font-black">
            <Image
              src={item.image}
              alt={`Step ${index + 1}`}
              width={62}
              height={62}
              className="mb-3"
            />
            <h3 className="font-black text-xl">{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default Instructions;
