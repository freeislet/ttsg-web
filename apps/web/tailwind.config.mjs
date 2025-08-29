/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151', // text-gray-700
            h1: {
              color: '#111827', // text-gray-900
            },
            h2: {
              color: '#111827', // text-gray-900
            },
            h3: {
              color: '#111827', // text-gray-900
            },
            h4: {
              color: '#111827', // text-gray-900
            },
            h5: {
              color: '#111827', // text-gray-900
            },
            h6: {
              color: '#111827', // text-gray-900
            },
            a: {
              color: '#2563eb', // text-blue-600
              '&:hover': {
                color: '#1d4ed8', // text-blue-700
              },
            },
            code: {
              color: '#374151', // text-gray-700
              backgroundColor: '#f3f4f6', // bg-gray-100
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#111827', // bg-gray-900
              color: '#f9fafb', // text-gray-50
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
            },
            blockquote: {
              borderLeftColor: '#3b82f6', // border-blue-500
              color: '#374151', // text-gray-700
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
