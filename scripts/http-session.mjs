export const baseUrl = process.env.OPSFLOW_BASE_URL ?? "http://localhost:3000";

export async function createAuthenticatedClient(email) {
  const cookies = new Map();

  function collectCookies(response) {
    for (const header of response.headers.getSetCookie()) {
      const [name, value] = header.split(";", 1)[0].split("=", 2);
      if (name && value) cookies.set(name, value);
    }
  }

  function cookieHeader() {
    return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  const csrfResponse = await fetch(new URL("/api/auth/csrf", baseUrl));
  if (!csrfResponse.ok) throw new Error(`CSRF request failed: ${csrfResponse.status}`);
  collectCookies(csrfResponse);
  const { csrfToken } = await csrfResponse.json();

  const loginResponse = await fetch(new URL("/api/auth/callback/credentials", baseUrl), {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(),
    },
    body: new URLSearchParams({ csrfToken, email, password: "demo123", callbackUrl: baseUrl }),
  });
  collectCookies(loginResponse);

  async function request(path, options = {}) {
    const response = await fetch(new URL(path, baseUrl), {
      ...options,
      headers: { Cookie: cookieHeader(), Origin: baseUrl, ...options.headers },
      redirect: "manual",
    });
    collectCookies(response);
    return response;
  }

  async function getPage(path) {
    const response = await request(path);
    return { status: response.status, html: await response.text() };
  }

  return { getPage, request };
}

export async function createAuthenticatedSession(email) {
  return (await createAuthenticatedClient(email)).getPage;
}
