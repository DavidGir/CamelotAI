'use client'

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../public/animation1.json';

const LoadingAnimation = () => {
  return (
    <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: 400, height: 400 }} />
  );
};

export default LoadingAnimation;