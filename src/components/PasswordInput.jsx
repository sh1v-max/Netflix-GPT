// PasswordInput.js
import React, { useState } from 'react'

const PasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false) // State to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative mb-8">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder= "password"
        className="w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <img
          src={
            showPassword
              ? 'https://cdn-icons-png.flaticon.com/512/709/709612.png'
              : 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png'
          }
          alt={showPassword ? 'Hide password' : 'Show password'}
          className="w-5 h-5 cursor-pointer filter invert"
        />
      </button>
    </div>
  )
}

export default PasswordInput
