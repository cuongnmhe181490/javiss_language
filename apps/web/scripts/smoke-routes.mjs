const baseUrl = (process.env.WEB_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

const requiredRoutes = ["/", "/login", "/register", "/demo-speaking"];
const requiredHeaders = [
  "x-content-type-options",
  "referrer-policy",
  "x-frame-options",
  "permissions-policy",
];

let failures = 0;

for (const route of requiredRoutes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";

  if (response.status !== 200) {
    console.error(`${route} expected 200, got ${response.status}`);
    failures += 1;
  }

  if (!contentType.includes("text/html")) {
    console.error(`${route} expected text/html, got ${contentType || "missing content-type"}`);
    failures += 1;
  }

  if (route === "/") {
    const html = await response.text();

    if (html.includes("http://localhost:3000") && process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("homepage metadata contains localhost while NEXT_PUBLIC_SITE_URL is set");
      failures += 1;
    }

    for (const expected of [
      'rel="canonical"',
      'property="og:url"',
      'property="og:image"',
      'name="twitter:image"',
    ]) {
      if (!html.includes(expected)) {
        console.error(`homepage missing metadata marker: ${expected}`);
        failures += 1;
      }
    }
  }
}

const headResponse = await fetch(`${baseUrl}/`, { method: "HEAD" });

for (const header of requiredHeaders) {
  if (!headResponse.headers.has(header)) {
    console.error(`missing security header: ${header}`);
    failures += 1;
  }
}

if (
  !headResponse.headers.has("content-security-policy") &&
  !headResponse.headers.has("content-security-policy-report-only")
) {
  console.error("missing CSP or CSP-Report-Only header");
  failures += 1;
}

const ogResponse = await fetch(`${baseUrl}/og-image.svg`);

if (ogResponse.status !== 200) {
  console.error(`/og-image.svg expected 200, got ${ogResponse.status}`);
  failures += 1;
}

if (failures > 0) {
  process.exit(1);
}

console.log(`Route smoke passed for ${baseUrl}`);
