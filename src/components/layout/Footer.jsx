import React from 'react'
// lucide-react ships UI icons only, not brand marks — keeping the GitHub
// octocat from react-icons here since there's no Lucide equivalent.
import { FaGithub } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="relative w-full bg-ink text-text-dark-muted px-8 md:px-16 pt-10 pb-20 sm:pb-6 text-sm border-t border-border-hairline">
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
          &copy; {new Date().getFullYear()} Cinegraph. Built for learning purposes.
        </p>
      </div>
    </footer>
  )
}

export default Footer
