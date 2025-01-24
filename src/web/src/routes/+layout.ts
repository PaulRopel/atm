import { PUBLIC_API_URL } from '$env/static/public';

// Disable SSR and prerendering for all routes
export const ssr = !PUBLIC_API_URL;
export const prerender = false;  // Enable prerendering for testing

// Add a load function to ensure the layout is processed
export function load() {
    return {
        // Return empty object to ensure layout is processed
    };
}

