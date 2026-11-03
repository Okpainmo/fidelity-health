// Only allows same-site paths for the `?next=` redirect after login, so a
// crafted link can't send users off to another site.
export function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}
