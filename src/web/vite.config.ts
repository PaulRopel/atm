import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const isStatic = process.env.VITE_ADAPTER === 'static';

	const API_PORT = 5173;
	const STATIC_PORT = 5174;
	const currentPort = isStatic ? STATIC_PORT : API_PORT;

	return {
		plugins: [
			paraglide({
				project: './project.inlang',
				outdir: './src/lib/paraglide'
			}),
			sveltekit()
		],
		optimizeDeps: {
			include: ['@sveltejs/kit', '@inlang/paraglide-sveltekit'],
			force: true
		},
		define: {
			'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
			'process.env.DATABASE_AUTH_TOKEN': JSON.stringify(env.DATABASE_AUTH_TOKEN),
			'process.env.PUBLIC_API_BASE': JSON.stringify(env.PUBLIC_API_BASE),
			'process.env.PUBLIC_API_URL': JSON.stringify(env.PUBLIC_API_URL),
			'process.env.PUBLIC_ALLOWED_ORIGINS': JSON.stringify(env.PUBLIC_ALLOWED_ORIGINS)
		},
		server: {
			port: currentPort,
			proxy: isStatic ? {
				'/api': {
					target: `http://localhost:${API_PORT}`,
					changeOrigin: true,
					configure: (proxy) => {
						proxy.on('proxyReq', (proxyReq, req) => {
							if (req.headers.origin) {
								proxyReq.setHeader('origin', req.headers.origin);
							}
						});

						proxy.on('proxyRes', (proxyRes, req) => {
							const origin = req.headers.origin || `http://localhost:${currentPort}`;
							proxyRes.headers['access-control-allow-credentials'] = 'true';
							proxyRes.headers['access-control-allow-origin'] = origin;
						});
					}
				}
			} : undefined
		},
		preview: {
			port: currentPort
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		build: {
			sourcemap: true
		}
	};
});
