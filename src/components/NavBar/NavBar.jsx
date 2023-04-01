import React from "react";
import { useState } from "react";
import logo from "../../assets/sausage.png";
import "./NavBar.css";

export default function NavBar({ login, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-black transition ease transform duration-300`;

  return (
    <>
      <nav className="bg-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl">Meaty Mail</span>
              <img
                className="block lg:hidden h-8 w-auto ml-4"
                src={logo}
                alt="Meaty Mail"
              />
              <img
                className="hidden lg:block h-8 w-auto ml-4"
                src={logo}
                alt="Meaty Mail"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  href="#"
                  onClick={() => login()}
                  className="bg-white border hover:border-white hover:bg-gray-800 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2 transition ease-in-out duration-300"
                >
                  Log In
                </button>

                <button
                  href="#"
                  onClick={() => logout()}
                  className="bg-gray-800 border hover:bg-white hover:text-gray-800 hover:border-black text-white font-semibold py-2 px-4 rounded-lg transition ease-in-out duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button
                className="flex flex-col h-12 w-12 border-2 border-black rounded justify-center items-center group"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div
                  className={`${genericHamburgerLine} ${
                    isOpen
                      ? "rotate-45 translate-y-3 opacity-50 group-hover:opacity-100"
                      : "opacity-50 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`${genericHamburgerLine} ${
                    isOpen ? "opacity-0" : "opacity-50 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`${genericHamburgerLine} ${
                    isOpen
                      ? "-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100"
                      : "opacity-50 group-hover:opacity-100"
                  }`}
                />
                {isOpen && (
                  <div className="absolute right-0 top-16 bg-black w-48 rounded-md py-2 shadow-lg">
                    <a
                      href="#"
                      onClick={() => login()}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 hover:underline transition ease-in-out duration-300"
                    >
                      Log In
                    </a>
                    <a
                      href="#"
                      onClick={() => logout()}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 hover:underline transition ease-in-out duration-300"
                    >
                      Log Out
                    </a>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
