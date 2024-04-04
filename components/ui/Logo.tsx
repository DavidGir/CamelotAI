import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  isMobile?: boolean;
}

const Logo = ({ isMobile }: LogoProps) => {
  return (
    // <Link href={'/'}>
      <div className="flex items-center">
        <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={30}
            height={35}
            className="sm:w-[35px] w-[25px] h-[25px] sm:h-[30px] mt-1"
          />
        </div>
        {!isMobile ? (
          <h1 className="shadows  text-primary text-[30px] sm:text-[35px] pl-2 pt-3">
            Camelot
          </h1>
        ) : null}
      </div>
    // </Link>
  );
};

export default Logo;