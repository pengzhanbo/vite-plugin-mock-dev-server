const jsonHeader = {
  'Content-Type': 'application/json',
}

export async function get(url: string) {
  return await fetch(url, { method: 'GET', headers: jsonHeader })
}

export async function post(url: string, body?: Record<string, any>) {
  return await fetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: jsonHeader,
  })
}
