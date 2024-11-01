/* This file is not used for any compilation purpose, it is only used for Tailwind Intellisense & Autocompletion in the source files */
import baseConfig from "@repo/config-tailwindcss";
import type { Config } from "tailwindcss";

const config: Config = {
  content: baseConfig.content,
  presets: [baseConfig],
} satisfies Config;

export default config;
