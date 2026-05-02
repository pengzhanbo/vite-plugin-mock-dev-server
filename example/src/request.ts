const jsonHeader = {
  'Content-Type': 'application/json',
}

export async function get(url: string) {
  const response = await fetch(url, { method: 'GET', headers: jsonHeader })
  await responseRender(url, 'GET', response)
}

export async function post(url: string, body?: Record<string, any>) {
  const response = await fetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: jsonHeader,
  })
  await responseRender(url, 'POST', response)
}

async function responseRender(url: string, method: string, response: Response) {
  const container = document.createElement('div')
  container.classList.add('container')
  let content = `<p class="info">
  <span class="method ${method.toLowerCase()}">${method}</span>
  <span class="url">${url}</span>`
  container.innerHTML = `${content}</p>`
  document.querySelector('.app')!.appendChild(container)

  content += `<span class="status">${response.status} ${response.statusText}</span>`
  container.innerHTML = `${content}</p>`

  const headerEl = document.createElement('pre')
  let headers = ''
  response.headers.forEach((value, key) => {
    headers += `${key}: ${value}\n`
  })
  headerEl.innerHTML = `<code>${headers || 'no headers'}</code>`
  headerEl.classList.add('code', 'headers')
  container.appendChild(headerEl)
  if (response.ok) {
    try {
      const type = response.headers.get('content-type')?.toLowerCase() || ''
      let str = ''
      if (type.startsWith('application/json'))
        str = JSON.stringify(await response.json(), null, 2)
      else
        str = await response.text()

      const code = document.createElement('pre')
      code.innerHTML = `<code>${str || 'no content'}</code>`
      code.classList.add('code')
      !str && code.classList.add('no-content')
      container.appendChild(code)
    }
    catch {}
  }
}
