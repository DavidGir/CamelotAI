'use client'

import React, { useState } from 'react';
import Lottie from 'react-lottie';

const LoadingAnimation = () => {
  const [animationState] = useState({
    isStopped: false,
    isPaused: false,
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: require('../../public/animation1.json'),
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <Lottie
      options={defaultOptions}
      height={400}
      width={400}
      isStopped={animationState.isStopped}
      isPaused={animationState.isPaused}
    />
  );
};

export default LoadingAnimation;