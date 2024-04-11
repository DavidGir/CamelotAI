'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useUser } from "@clerk/clerk-react";
import Logo from './Logo';

export default function HeaderDashboard() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    // This effect will run every time the `isSignedIn` value changes.
    // When a user signs out, `isSignedIn` will become false, and it will clear the local storage for the saved audio url.
    if (!isSignedIn) {
      localStorage.removeItem('savedAudioUrls');
    }
  }, [isSignedIn]);


  return (
    <header className="top-0 bg-ancient-beige w-full border-b border-b-slate-200 shadow-sm">
      <div className="h-16 container mx-auto">
        <nav className="flex justify-between ">
            <Logo />
          <div className="flex items-center gap-5">
            {isSignedIn ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <Link href="/sign-in">Log in</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
