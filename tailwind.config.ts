
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const builderColors =
	"(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const builderShades = "(50|100|200|300|400|500|600|700|800|900|950)";
const builderSpacing =
	"(0|px|0\\.5|1|1\\.5|2|2\\.5|3|3\\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|56|64|72|80|96)";
const builderAlpha = ["5", "10", "15", "20", "25", "30", "40", "50", "60", "70", "75", "80", "90"];
const builderHtmlSafelist = [
	"container",
	"mx-auto",
	"sr-only",
	"not-sr-only",
	"prose",
	"prose-sm",
	"prose-lg",
	"prose-slate",
	"text-transparent",
	"bg-clip-text",
	"divide-y",
	"divide-x",
	"divide-slate-100",
	"divide-slate-200",
	...builderAlpha.flatMap((alpha) => [
		`bg-white/${alpha}`,
		`bg-black/${alpha}`,
		`text-white/${alpha}`,
		`text-black/${alpha}`,
		`border-white/${alpha}`,
		`border-black/${alpha}`,
	]),
	{ pattern: new RegExp(`^(bg|text|border|ring|from|via|to)-${builderColors}-${builderShades}$`), variants: ["hover", "focus", "group-hover"] },
	{ pattern: /^(bg|text|border|ring)-(white|black)$/, variants: ["hover", "focus"] },
	{ pattern: new RegExp(`^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-${builderSpacing}$`), variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(w|h|min-h|max-h)-(0|1|2|3|4|5|6|8|10|12|14|16|20|24|28|32|36|40|44|48|56|64|72|80|96|full|screen|auto|fit|min|max)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(max-w|size)-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|none|screen-sm|screen-md|screen-lg|screen-xl|screen-2xl)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(grid-cols|col-span|columns)-(1|2|3|4|5|6|7|8|9|10|11|12|none)$/, variants: ["sm", "md", "lg", "xl", "2xl"] },
	{ pattern: /^(flex|inline-flex|grid|inline-grid|block|inline-block|hidden|relative|absolute|fixed|sticky|overflow-hidden|overflow-auto|overflow-x-auto|object-cover|object-contain)$/ },
	{ pattern: /^(items|justify|content|place)-(start|end|center|between|around|evenly|stretch)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(flex-row|flex-col|flex-wrap|flex-nowrap|shrink|shrink-0|grow|grow-0)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(font)-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/ },
	{ pattern: /^(leading)-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/ },
	{ pattern: /^(text)-(left|center|right|justify)$/, variants: ["sm", "md", "lg", "xl"] },
	{ pattern: /^(rounded|rounded-sm|rounded-md|rounded-lg|rounded-xl|rounded-2xl|rounded-3xl|rounded-full)$/ },
	{ pattern: /^(border|border-0|border-2|border-4|border-t|border-r|border-b|border-l)$/ },
	{ pattern: /^(shadow|shadow-sm|shadow-md|shadow-lg|shadow-xl|shadow-2xl|shadow-none)$/ },
	{ pattern: /^(opacity)-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/ },
	{ pattern: /^(transition|duration-75|duration-100|duration-150|duration-200|duration-300|duration-500|duration-700|ease-in|ease-out|ease-in-out)$/ },
	{ pattern: /^(aspect)-(auto|square|video)$/ },
	{ pattern: /^(z)-(0|10|20|30|40|50)$/ },
];

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	// Classes utiles aux blocs HTML stockés en base. Tailwind ne scanne pas le HTML injecté au runtime.
	safelist: builderHtmlSafelist,
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
	plugins: [tailwindcssAnimate],
} satisfies Config;
