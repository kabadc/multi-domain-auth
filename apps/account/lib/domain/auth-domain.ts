/**
 * Sample domain service for multi-domain authentication validation.
 * Business logic isolated cleanly outside UI client components.
 */

export interface DomainValidationOptions {
  allowedDomains: string[];
}

export function isValidRedirectDomain(
  targetUrl: string,
  options: DomainValidationOptions,
): boolean {
  try {
    const url = new URL(targetUrl);
    const hostname = url.hostname.toLowerCase();

    return options.allowedDomains.some((allowed) => {
      const normalizedAllowed = allowed.toLowerCase().replace(/^\./, "");
      return (
        hostname === normalizedAllowed ||
        hostname.endsWith(`.${normalizedAllowed}`)
      );
    });
  } catch {
    return false;
  }
}

export function sanitizeRedirectPath(path: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  return path;
}
