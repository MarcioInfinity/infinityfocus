
import type { Config } from "tailwindcss";

export default {
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(220 100% 60%)', // Bright blue
					foreground: 'hsl(0 0% 100%)',
					dark: 'hsl(220 100% 40%)',
				},
				secondary: {
					DEFAULT: 'hsl(240 20% 20%)', // Dark gray-blue
					foreground: 'hsl(0 0% 90%)'
				},
				accent: {
					DEFAULT: 'hsl(280 60% 60%)', // Purple accent
					foreground: 'hsl(0 0% 100%)',
					dark: 'hsl(280 60% 40%)',
				},
				muted: {
					DEFAULT: 'hsl(240 10% 15%)',
					foreground: 'hsl(240 5% 70%)'
				},
				destructive: {
					DEFAULT: 'hsl(0 84.2% 60.2%)',
					foreground: 'hsl(210 40% 98%)'
				},
				popover: {
					DEFAULT: 'hsl(240 15% 12%)',
					foreground: 'hsl(0 0% 95%)'
				},
				card: {
					DEFAULT: 'hsl(240 15% 10%)',
					foreground: 'hsl(0 0% 95%)'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsla(220, 100%, 60%, 0.3), 0 0 40px hsla(220, 100%, 60%, 0.1)' 
					},
					'50%': { 
						boxShadow: '0 0 30px hsla(220, 100%, 60%, 0.5), 0 0 60px hsla(220, 100%, 60%, 0.2)' 
					}
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px hsla(280, 60%, 60%, 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 20px hsla(280, 60%, 60%, 0.6), 0 0 30px hsla(280, 60%, 60%, 0.3)' 
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bg-flow': {
					'0%': { transform: 'translateX(-100%) translateY(-100%) rotate(0deg)' },
					'100%': { transform: 'translateX(100vw) translateY(100vh) rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'bg-flow': 'bg-flow 20s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
