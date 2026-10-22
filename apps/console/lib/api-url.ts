/** The Express API's origin, as the web server reaches it. Read at request time, not build. */
export function apiUrl(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL is not set");
  return url;
}
