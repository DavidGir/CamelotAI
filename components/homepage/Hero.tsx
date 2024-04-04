import Link from 'next/link';
import Instructions from './Instructions';

const Hero = () => {
 
  return (
    <div className="container pt-[150px] md:pt-[120px] pb-[100px] sm:pb-[290px] px-[22px] sm:px-0 mx-auto text-center">
      <h2 className="text-center max-w-[867px] pb-5 sm:pb-7 text-[50px] sm:text-[85px] leading-[39.5px] tracking-[-1.04px] sm:leading-[75px] sm:tracking-[-2.74px] mx-auto sm:mt-12 mt-10">
        Chat with your docs!
      </h2>
      <p className="text-xl sm:text-2xl pb-10 sm:pb-8 leading-[19px] sm:leading-[34.5px] w-[232px] sm:w-full tracking-[-0.4px] sm:tracking-[-0.6px] text-center mx-auto">
        Have a conversation with your documents, policies, and contracts for free.
      </p>
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