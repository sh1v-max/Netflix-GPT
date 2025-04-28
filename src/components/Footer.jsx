import React from 'react'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="absolute right-0 left-0 -bottom-80 md:-bottom-72 bg-black text-gray-400 px-8 md:px-16 pt-10 pb-6 text-sm">

      <div className="flex gap-6 mb-6">
        <FaFacebookF className="hover:text-white cursor-pointer" />
        <FaInstagram className="hover:text-white cursor-pointer" />
        <FaTwitter className="hover:text-white cursor-pointer" />
        <FaYoutube className="hover:text-white cursor-pointer" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <a href="#" className="hover:underline">Audio Description</a>
        <a href="#" className="hover:underline">Investor Relations</a>
        <a href="#" className="hover:underline">Legal Notices</a>
        <a href="#" className="hover:underline">Help Center</a>
        <a href="#" className="hover:underline">Jobs</a>
        <a href="#" className="hover:underline">Cookie Preferences</a>
        <a href="#" className="hover:underline">Gift Cards</a>
        <a href="#" className="hover:underline">Terms of Use</a>
        <a href="#" className="hover:underline">Media Center</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Contact Us</a>
        <a href="#" className="hover:underline">Corporate Info</a>
      </div>

      <div className="mb-6">
        <select className="bg-black border border-gray-500 text-white px-3 py-1">
          <option>English</option>
          <option>Filipino</option>
          <option>Hindi</option>
          <option>Japanese</option>
        </select>
      </div>

      <p className="text-xs text-gray-500">&copy; 2025 Netflix Clone by You. All rights reserved.</p>
    </footer>
  )
}

export default Footer
