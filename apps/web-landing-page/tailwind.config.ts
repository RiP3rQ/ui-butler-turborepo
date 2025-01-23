import baseConfig from "@shared/config-tailwindcss";
import type { Config } from "tailwindcss";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
