import React from 'react'
import { FaGithub } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="relative w-full bg-ink text-text-dark-muted px-8 md:px-16 pt-10 pb-6 text-sm border-t border-white/5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <a
          href="https://github.com/sh1v-max/Netflix-GPT"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-text-dark transition-colors"
        >
          <FaGithub size={16} />
          Source on GitHub
        </a>
        <p className="text-xs text-text-dark-muted">
          &copy; {new Date().getFullYear()} Cinegraph. Built for learning
          purposes — not affiliated with Netflix, Inc.
        </p>
      </div>
    </footer>
  )
}

export default Footer
