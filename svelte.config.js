import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  },

  extensions: ['.svelte', ...mdsvexConfig.extensions],

  preprocess: [
    preprocess(),
    vitePreprocess(),
    mdsvex(mdsvexConfig)
  ]
};

export default config;
