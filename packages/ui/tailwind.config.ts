/* This file is not used for any compilation purpose, it is only used for Tailwind Intellisense & Autocompletion in the source files */
import baseConfig from "@repo/config-tailwindcss";
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: baseConfig.content,
  presets: [baseConfig],
    theme: {
    	extend: {
    		colors: {
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
    		}
    	}
    }
} satisfies Config;

export default config;
