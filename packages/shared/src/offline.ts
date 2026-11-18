// Pure helpers used by the offline system (the service worker uses the same regex).
export const extractNextAssets = (html: string): string[] => [...new Set([...html.matchAll(/\/_next\/static\/[^"'\\\s<>]+/g)].map(m => m[0]))];
export const mergeQueue = (q: string[], lesson: string): string[] => (q.includes(lesson) ? q : [...q, lesson]);
