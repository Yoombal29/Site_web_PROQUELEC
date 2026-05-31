
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	// Classes utilisées dans le contenu HTML stocké en DB (Craft.js HtmlBlock)
	safelist: [
		// Dégradés hero
		'from-[#1e3a5f]', 'via-[#1a3366]', 'to-[#2563eb]',
		// Gradient text
		'from-yellow-300', 'to-amber-400', 'text-transparent', 'bg-clip-text',
		// Boutons et hover
		'hover:bg-blue-50', 'hover:bg-white/10', 'hover:border-white/60',
		'hover:scale-[1.02]', 'hover:bg-gray-100',
		// Ombres
		'shadow-2xl', 'shadow-xl', 'shadow-md', 'shadow-sm', 'shadow-white/20',
		// Statistiques - cartes avec dégradés pastel
		'from-blue-50', 'to-white', 'border-blue-100',
		'from-green-50', 'border-green-100',
		'from-purple-50', 'border-purple-100',
		'from-amber-50', 'border-amber-100',
		'text-blue-700', 'text-green-700', 'text-purple-700', 'text-amber-700',
		'text-blue-800',
		// Cartes services
		'bg-blue-100', 'bg-green-100', 'bg-amber-100',
		'rounded-2xl', 'rounded-xl', 'rounded-3xl',
		// Boutons blancs
		'bg-white', 'text-[#1e3a5f]', 'border-white/40', 'border-white/20',
		// Footer
		'border-gray-200', 'hover:text-blue-700',
		// Divers
		'pointer-events-none', 'backdrop-blur-sm',
		// Textes
		'text-white/80', 'text-white/85', 'text-white/90',
		'bg-white/15', 'bg-white/20', 'bg-white/10',
		'text-yellow-200',
		// Animations personnalisées
		'fadeSlideUp',
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
			fontFamily: {
				roboto: ['Roboto', 'Arial', 'sans-serif'],
			},
			colors: {
				proqblue: {
					DEFAULT: "#2376df", // bleu électrique PROQUELEC
					dark: "#054393",
				},
				proqgray: {
					DEFAULT: "#f4f7fa",
					medium: "#e2e6ea",
					dark: "#949ba4",
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: "#2376df",
					foreground: '#fff'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
