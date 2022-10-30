async function mockData() {
  await fetch('/api/test?aa=12&bb=33', {
    method: 'POST',
    body: JSON.stringify({ aaa: 111 }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await fetch('/api/test/123?aa=23', {
    method: 'POST',
    body: JSON.stringify({ id: 123 }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await fetch('/api/login/123?aa=23', {
    method: 'POST',
    body: JSON.stringify({ id: 123 }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await fetch('/api/login/id/123456789')

  await fetch('/api/post/list', {
    method: 'POST',
    body: JSON.stringify({ page: 1 }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await fetch('/api/custom/fail')
}

mockData()
