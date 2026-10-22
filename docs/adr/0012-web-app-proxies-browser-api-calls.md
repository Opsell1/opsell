# The web app proxies browser API calls through its own /api route

Browsers call the API at the web app's own origin, under `/api`, and a Next.js route handler forwards each request to the Express API, whose address it reads from `API_URL` at request time.
Server components skip the proxy and call the API directly with the browser's cookies.
We chose this so sign-in cookies are first-party to the web origin and the browser needs no CORS, while Next.js still never touches data itself (ADR 0004).

## Considered Options

- **Next.js rewrites**: the same browser-facing shape with less code, but rewrite destinations are fixed at build time, so one Docker image could not run against a different API in each environment.
- **Browsers call the API's own origin**: no proxy hop, but it needs CORS with credentials, and cookies shared across a parent domain, for every environment.

## Consequences

- The proxy must forward request and response headers faithfully, including every `Set-Cookie`, and drop only hop-by-hop headers.
- Better Auth's base URL is the web origin, because that is the origin browsers see.
