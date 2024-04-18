'use client'

import { useState } from 'react';
import Logo from '../ui/Logo';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';


const Header = () => {
  const [anchorEl, setAnchorEl] = useState<EventTarget & HTMLButtonElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenu = (e: React.MouseEvent<EventTarget & HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div className="container mx-auto hidden h-[78px] w-full items-start justify-between rounded-[30px] border border-solid border-[rgba(0,0,0,0.17)] bg-gun-gray px-5 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] sm:flex">
        <Logo />
        <div className="mt-4 gap-4 sm:flex">
          <Link
            href="/dashboard"
            className="text-primary border-black rounded-[18px] border border-solid px-[22px] py-1.5 text-center text-xl font-normal "
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="bg_linear border-primary rounded-[18px] border border-solid px-[22px] py-1.5 text-center text-xl font-normal text-white "
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Mobile Menu Icon */}
      <div className="flex h-[54px] items-center justify-between border-b-[0.5px] border-solid border-b-white px-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] sm:hidden">
        <Logo isMobile={true} />
        <div className="flex items-baseline justify-center">
          <IconButton
            aria-label="menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleClose}
          >
           <MenuItem 
              onClick={handleClose}
              className=""
            >
              <Link href="/dashboard" >Log In</Link>
            </MenuItem>
            <MenuItem 
              onClick={handleClose}
              className=""
            >
              <Link href="/settings">Sign Up</Link>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </>
  );
};

export default Header;