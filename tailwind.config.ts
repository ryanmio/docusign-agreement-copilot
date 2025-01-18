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
  			docusign: {
  				cobalt: '#4C00FF',
  				inkwell: '#130032',
  				violet: '#26065D',
  				mist: '#CBC2FF',
  				poppy: '#FF5252',
  				ecru: '#F8F3F0'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: '#4C00FF',
  			background: 'hsl(var(--background))',
  			foreground: '#130032',
  			primary: {
  				DEFAULT: '#4C00FF',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#CBC2FF',
  				foreground: '#130032'
  			},
  			destructive: {
  				DEFAULT: '#FF5252',
  				foreground: '#FFFFFF'
  			},
  			muted: {
  				DEFAULT: '#F8F3F0',
  				foreground: '#26065D'
  			},
  			accent: {
  				DEFAULT: '#FF5252',
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
  				'1': '#4C00FF',
  				'2': '#CBC2FF',
  				'3': '#26065D',
  				'4': '#FF5252',
  				'5': '#F8F3F0'
  			}
  		},
  		borderRadius: {
  			lg: '8px',
  			md: '4px',
  			sm: '3px'
  		},
  		spacing: {
  			'ds-1': '4px',
  			'ds-2': '8px',
  			'ds-3': '16px',
  			'ds-4': '24px',
  			'ds-5': '32px'
  		},
  		fontSize: {
  			'ds-body': '16px',
  			'ds-small': '14px',
  			'ds-heading': [
  				'24px',
  				'32px'
  			],
  			'ds-subheading': [
  				'18px',
  				'24px'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: 'none',
  					color: 'inherit',
  					p: {
  						marginTop: '0.5em',
  						marginBottom: '0.5em',
  					},
  					ul: {
  						marginTop: '0.5em',
  						marginBottom: '0.5em',
  					},
  					li: {
  						marginTop: '0',
  						marginBottom: '0',
  					},
  					pre: {
  						marginTop: '0',
  						marginBottom: '0',
  						paddingTop: '0',
  						paddingBottom: '0',
  						backgroundColor: 'transparent',
  					},
  				},
  			},
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography')
  ],
} satisfies Config;

export default config;
