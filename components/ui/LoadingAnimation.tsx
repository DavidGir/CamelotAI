'use client'

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '@/public/gray-spinner.json';

const LoadingAnimation = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center">
       <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: 400, height: 400 }} />       
    </div>
  );
};

export default LoadingAnimation;