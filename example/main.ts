const jsonHeader = {
  'Content-Type': 'application/json',
}

// @see ./mock/user.mock.ts
async function mockUser() {
  await fetch('/api/user/list')
  await fetch('/api/user/mark2022')
}

async function mockPost() {
  await fetch('/api/post/list', {
    method: 'POST',
    body: JSON.stringify({ page: 1 }),
    headers: jsonHeader,
  })
}

async function useMockjs() {
  await fetch('/api/mockjs')
}

async function mockData() {
  await fetch('/api/test?aa=12&bb=33', {
    method: 'POST',
    body: JSON.stringify({ aaa: 111 }),
    headers: jsonHeader,
  })
  await fetch('/api/test/123?aa=23', {
    method: 'POST',
    body: JSON.stringify({ id: 123 }),
    headers: jsonHeader,
  })
  await fetch('/api/login/123?aa=23', {
    method: 'POST',
    body: JSON.stringify({ id: 123 }),
    headers: jsonHeader,
  })

  await fetch('/api/custom/fail')
}
mockUser()
mockPost()
useMockjs()
mockData()
