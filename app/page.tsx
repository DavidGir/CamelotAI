// Will consist of my home page 
import Header from '../components/homepage/Header';
import Hero from '../components/homepage/Hero';
import { currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Footer from '../components/homepage/Footer';

export default async function Home() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;
  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <>
    <main className="sm:p-10 ancient-scroll-bg ancient-scroll-bg-mobile">
      <Header />
      <Hero />
    </main>
    <Footer />
    </>
  );
}