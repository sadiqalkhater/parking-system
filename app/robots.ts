import type { MetadataRoute } from 'next'

// Private application: keep crawlers out of the app and its API.
// Note: robots.txt is not a security control — every API route still enforces authentication.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', disallow: '/' }] }
}
