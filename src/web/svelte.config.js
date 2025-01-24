import adapterStatic from '@sveltejs/adapter-static';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// import adapter from 'svelte-kit-sst';

// set default adapter
process.env.VITE_ADAPTER ??= 'node';

const adapterStaticConfigured = adapterStatic({
	fallback: 'index.html',
	pages: 'build-static',
	assets: 'build-static',
	strict: false,
	precompress: false,
	env: {
		PUBLIC_API_BASE: process.env.PUBLIC_API_BASE,
		PUBLIC_API_URL: process.env.PUBLIC_API_URL
	}
});

const adapterNodeConfigured = adapterNode({
	out: 'build-node',
	precompress: false,
	env: {
		PUBLIC_API_BASE: process.env.PUBLIC_API_BASE,
		PUBLIC_API_URL: process.env.PUBLIC_API_URL,
		PUBLIC_ALLOWED_ORIGINS: process.env.PUBLIC_ALLOWED_ORIGINS
	}
});


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: process.env.VITE_ADAPTER === 'node' ? adapterNodeConfigured : adapterStaticConfigured,
		
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		// adapter: adapter({
		// 	fallback: 'index.html', // Key for SPA mode
		// 	strict: false
		// }),
		// prerender: {
		// 	handleHttpError: ({ path, message }) => {
		// 		// Ignore all 404s except for the root page
		// 		if (path !== '/' && message.includes('Not found')) return;
		// 		throw new Error(message);
		// 	}
		// },
		csrf: {
			checkOrigin: process.env.NODE_ENV === 'production'
		},
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;
