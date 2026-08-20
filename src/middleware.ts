import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from './utils/config';

const productionHostname = new URL(getSiteConfig().site.url).hostname;

/**
 * Security middleware for adding CSP and other security headers
 * Runs on all requests in SSG mode, intercepting responses
 */
export const onRequest = defineMiddleware((context, next) => {
  return next().then((response) => {
    // Content Security Policy (CSP) - strict but practical
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    // Apply security headers
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=()'
    );

    // HSTS (Strict-Transport-Security) - encourage HTTPS
    // Only on production domain
    if (context.url.hostname === productionHostname) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    return response;
  });
});
