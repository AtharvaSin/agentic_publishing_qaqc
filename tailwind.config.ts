import type { Config } from 'tailwindcss';

const config: Config = {
  prefix: 'tw-',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian backgrounds
        'obsidian-900': '#0F1419',
        'obsidian-800': '#1A1F2E',
        'obsidian-700': '#252A3B',
        'obsidian-600': '#374151',
        'obsidian-500': '#4B5563',
        'obsidian-400': '#6B7280',
        'obsidian-300': '#9CA3AF',
        'obsidian-200': '#D1D5DB',
        'obsidian-100': '#F3F4F6',

        // Aurora accents
        'aurora-cyan': '#00D4FF',
        'aurora-purple': '#8B5CF6',
        'aurora-pink': '#EC4899',
        'aurora-blue': '#3B82F6',
        'aurora-teal': '#14B8A6',

        // Status colors
        'status-critical': '#EF4444',
        'status-high': '#EC4899',
        'status-medium': '#F59E0B',
        'status-low': '#00D4FF',
        'status-success': '#10B981',
        'status-info': '#3B82F6',

        // Fluent brand
        'fluent-brand': '#0078D4',
        'fluent-brand-hover': '#106EBE',
        'fluent-brand-pressed': '#005A9E',
      },
      fontFamily: {
        fluent: [
          '"Segoe UI"',
          '"Segoe UI Web (West European)"',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      fontSize: {
        'caption': ['12px', { lineHeight: '16px' }],
        'body-sm': ['12px', { lineHeight: '16px' }],
        'body': ['14px', { lineHeight: '20px' }],
        'body-lg': ['16px', { lineHeight: '22px' }],
        'subtitle': ['20px', { lineHeight: '28px' }],
        'title': ['28px', { lineHeight: '36px' }],
        'display': ['40px', { lineHeight: '52px' }],
      },
      boxShadow: {
        'fluent-2': '0 1.6px 3.6px rgba(0,0,0,0.13), 0 0.3px 0.9px rgba(0,0,0,0.11)',
        'fluent-4': '0 3.2px 7.2px rgba(0,0,0,0.13), 0 0.6px 1.8px rgba(0,0,0,0.11)',
        'fluent-8': '0 6.4px 14.4px rgba(0,0,0,0.13), 0 1.2px 3.6px rgba(0,0,0,0.11)',
        'fluent-16': '0 12.8px 28.8px rgba(0,0,0,0.13), 0 2.4px 7.2px rgba(0,0,0,0.11)',
      },
      borderRadius: {
        'fluent-sm': '2px',
        'fluent': '4px',
        'fluent-md': '6px',
        'fluent-lg': '8px',
        'fluent-xl': '12px',
      },
      spacing: {
        'fluent-xs': '4px',
        'fluent-sm': '8px',
        'fluent-md': '12px',
        'fluent-lg': '16px',
        'fluent-xl': '20px',
        'fluent-2xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
