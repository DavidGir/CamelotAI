import Header from '../components/homepage/Header';
import Hero from '../components/homepage/Hero';
import { currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Footer from '../components/homepage/Footer';
import "../styles/global.css";

export default async function Home() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;
  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <>
    <main className="z-20 w-full h-full bg-gray-200">
      {/* <Header />  */}
      <Hero />
    </main>
    <Footer />
    </>
  );
}