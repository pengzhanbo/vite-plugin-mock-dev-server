const jsonHeader = {
  'Content-Type': 'application/json',
}

export async function get(url: string) {
  const response = await fetch(url, { method: 'GET', headers: jsonHeader })
  await renderResponse(url, 'GET', response)
}

export async function post(url: string, body?: Record<string, any>) {
  const response = await fetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: jsonHeader,
  })
  await renderResponse(url, 'POST', response)
}

async function renderResponse(url: string, method: string, response: Response) {
  const container = document.createElement('div')
  container.classList.add('container')
  let content = `<p><b>Request URL:</b><span>${url}</span></p>
  <p><b>Request Method:</b><span>${method}</span></p>
  <p><b>Request Status:</b>${response.status} ${response.statusText}</p>`
  if (response.ok) {
    let result = {}
    try {
      result = await response.json()
    }
    catch {}
    const str = JSON.stringify(result, null, 2)
    content += `<div><p><b>Response Body: </b></p><pre><code>${str}</code></pre></div>`
  }
  container.innerHTML = content
  document.querySelector('.app')!.appendChild(container)
}
