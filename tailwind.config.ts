import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Docusign Brand Colors
        docusign: {
          cobalt: '#4C00FF', // Primary Brand Color
          inkwell: '#130032', // Dark Theme
          violet: '#26065D', // Deep Violet
          mist: '#CBC2FF', // Light Theme
          poppy: '#FF5252', // Accent Color
          ecru: '#F8F3F0', // Neutral
        },
        // Preserve existing color tokens but map some to Docusign colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: '#4C00FF', // Using Docusign cobalt
        background: 'hsl(var(--background))',
        foreground: '#130032', // Using Docusign inkwell
        primary: {
          DEFAULT: '#4C00FF', // Docusign cobalt
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#CBC2FF', // Docusign mist
          foreground: '#130032' // Docusign inkwell
        },
        destructive: {
          DEFAULT: '#FF5252', // Docusign poppy
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#F8F3F0', // Docusign ecru
          foreground: '#26065D' // Docusign violet
        },
        accent: {
          DEFAULT: '#FF5252', // Docusign poppy
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        chart: {
          '1': '#4C00FF', // Docusign cobalt
          '2': '#CBC2FF', // Docusign mist
          '3': '#26065D', // Docusign violet
          '4': '#FF5252', // Docusign poppy
          '5': '#F8F3F0'  // Docusign ecru
        }
      },
      borderRadius: {
        lg: '8px', // Docusign card radius
        md: '4px', // Docusign button/input radius
        sm: '3px'  // Docusign icon radius
      },
      spacing: {
        'ds-1': '4px',   // Base spacing unit
        'ds-2': '8px',   // Double base
        'ds-3': '16px',  // Form padding
        'ds-4': '24px',  // Card padding
        'ds-5': '32px',  // Grid base unit
      },
      fontSize: {
        'ds-body': '16px',
        'ds-small': '14px',
        'ds-heading': ['24px', '32px'],
        'ds-subheading': ['18px', '24px'],
      },
      // Preserve existing animations and other extensions
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
