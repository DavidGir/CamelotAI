import Header from '../components/homepage/Header';
import Hero from '../components/homepage/Hero';
import { currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Footer from '../components/homepage/Footer';
import HomeBg from './HomeBg';
import Image from 'next/image';
import homeBackgroundImage from '../public/hero-background.svg'

export default async function Home() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;
  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <>
    <HomeBg
      image={
        <Image
          src={homeBackgroundImage}
          alt="Home background image"
          className="object-cover object-center"
          fill
          priority
        />
      }
    >
    <main className="z-20 w-full md:p-10 ancient-scroll-bg-mobile">
      <Header /> 
      <Hero />
    </main>
    </HomeBg>
    <Footer />
    </>
  );
}