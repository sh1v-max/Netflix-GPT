import React from 'react'

const Header = () => {
  return (
    <div>
          <header className="bg-black text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-3xl font-extrabold text-red-600 tracking-wider cursor-pointer">
          NETFLIX
        </h1>

        {/* Right Side - You can add buttons/menus here */}
        <nav className="flex items-center space-x-4">
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition duration-300">
            Sign In
          </button>
        </nav>
      </div>
    </header>
    </div>
  )
}

export default Header