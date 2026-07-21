'use client'
import Link from 'next/link';
import React, { FC, useState, useEffect } from 'react';
import NavItems from '../utilis/NavItems';
import { ThemeSwitcher } from '../utilis/ThemeSwitcher';
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from 'react-icons/hi';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const Header: FC<Props> = ({ open, setOpen, activeItem }) => {
    const [openSidebar, setOpenSidebar] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setActive(true);
            } else {
                setActive(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).id === "screen") {
            setOpenSidebar(false);
        }
    };

    return (
        <div className='w-full relative'>
            <div className={`${active ? "dark:bg-opacity-50 dark:bg-linear-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-white shadow-xl transition duration-500" : "w-full border-b dark:border-[#ffffff1c] h-[80px] z-[80] dark:shadow"}`}>
                <div className="w-[95%] 800px:w-[92%] m-auto h-full flex items-center justify-between py-2">
                    <div>
                        <Link href="/"
                            className={`text-[25px] font-Poppins font-medium text-black dark:text-white`}
                        >
                            ELearning
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <NavItems
                            activeItem={activeItem}
                            isMobile={false}
                        />
                        <ThemeSwitcher />
                        {/* mobile menu icon */}
                        <div className="800px:hidden">
                            <HiOutlineMenuAlt3
                                size={25}
                                className="cursor-pointer dark:text-white text-black"
                                onClick={() => setOpenSidebar(true)}
                            />
                        </div>
                        <HiOutlineUserCircle
                            size={25}
                            className="hidden 800px:block cursor-pointer dark:text-white text-black ml-4"
                            onClick={() => setOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* mobile side bar */}
            {openSidebar && (
                <div
                    className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
                    onClick={handleClose}
                    id="screen"
                >
                    <div className="w-[70%] fixed z-[999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                        <NavItems activeItem={activeItem} isMobile={true} />
                        <HiOutlineUserCircle
                            size={25}
                            className="cursor-pointer ml-5 my-2 dark:text-white text-black"
                            onClick={() => setOpen(true)}
                        />
                        <br />
                        <br />
                        <p className="text-[16px] px-2 pl-5 text-black dark:text-white font-Poppins">
                            Copyright © 2026 ELearning
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header;
