const LOCAL_API_BASE_URL = "http://localhost:4000";

export function resolveApiBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  return LOCAL_API_BASE_URL;
}

export function apiUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${resolveApiBaseUrl()}${normalizedPath}`;
}

export function hasConfiguredApiBaseUrl() {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim());
}
