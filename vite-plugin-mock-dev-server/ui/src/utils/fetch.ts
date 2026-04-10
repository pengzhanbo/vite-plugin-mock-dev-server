import { ofetch as _ofetch } from 'ofetch'

function normalize(path: string) {
  return path.replace(/\/+/g, '/')
}

export const ofetch = _ofetch.create({
  baseURL: new URL(normalize(`${import.meta.env.BASE_URL}/.vite-mock/api`), window.location.origin).toString(),
})
