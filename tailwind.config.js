/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_drafts/**/*.{html,md}",
    "./_posts/**/*.{html,md}",
    "./_pages/**/*.{html,md}",
    "./_includes/**/*.{html,md}",
    "./_layouts/**/*.{html,md}",
    "./*.{html,md}",
  ],
  theme: {
    extend: {
      hyphens: {
        'auto': 'auto',
      },
    },
  },
  plugins: [],
}

