import Link from 'next/link';
import { UserButton, currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import Logo from './Logo';

export default async function HeaderDashboard() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;

  return (
    <header className="top-0 bg-ancient-beige w-full border-b border-b-slate-200 shadow-sm">
      <div className="h-16 container mx-auto">
        <nav className="flex justify-between ">
            <Logo />
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
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
