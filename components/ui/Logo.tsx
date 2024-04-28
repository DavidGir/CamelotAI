import Image from 'next/image';

interface LogoProps {
  isMobile?: boolean;
}

const Logo = ({ isMobile }: LogoProps) => {
  return (
    // <Link href={'/'}>
      <div className="flex items-end">
        <div className="flex justify-center">
          <Image
            src="/camelot-mono-no-bg.png"
            alt="Logo"
            width={30}
            height={35}
            className="sm:w-[50px] w-[25px] h-[25px] sm:h-[50px] mt-1"
          />
        </div>
        {!isMobile ? (
          <h1 className="shadows text-white text-[30px] sm:text-[35px] pl-2 pt-3">
            CamelotAi
          </h1>
        ) : null}
      </div>
    // </Link>
  );
};

export default Logo;