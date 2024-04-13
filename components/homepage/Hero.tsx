'use client'

import Link from 'next/link';
import dynamic from 'next/dynamic';
import AnimatedSearchBarIntro from '../ui/AnimatedSearchBarIntro';

// Client component that is loaded dynamically to ensure they are only rendered client-side:
const Instructions = dynamic(() => import('./Instructions'), { ssr: false });

const Hero = () => {
 
  return (
    <div className="container flex flex-col justify-center pt-[150px] md:pt-[120px] pb-[100px] sm:pb-[250px] px-[22px] sm:px-0 mx-auto text-center">
      <h2 className="text-center max-w-[867px] pb-5 sm:pb-20 text-[50px] sm:text-[85px] leading-[39.5px] tracking-[-1.04px] sm:leading-[75px] sm:tracking-[-2.74px] mx-auto sm:mt-12 mt-10">
        Chat with your docs!
      </h2>
      <div className="mb-10">
      <AnimatedSearchBarIntro />
      </div>
      <div className="mb-10">
      <Instructions />
      </div>
      <Link href={'/dashboard'}>
        <button className="bg_linear rounded-full sm:px-14 px-12 py-[2.5px] mb-10 sm:py-4 text-white text-center text-xl sm:text-[30px] font-medium leading-[37px] tracking-[-0.3px]">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default Hero;