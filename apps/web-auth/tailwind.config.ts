import baseConfig from "@repo/config-tailwindcss";
import type { Config } from "tailwindcss";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
