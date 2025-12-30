import type { Config } from 'tailwindcss';
import preset from '@pg19/ui/tailwind.preset';

export default {
  presets: [preset],
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    '../../packages/ui/components/**/*.vue',
  ],
} satisfies Config;
