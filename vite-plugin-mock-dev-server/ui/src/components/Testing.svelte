<script lang='ts'>
  import type { TestRequest, TestResponse } from '../types'
  import { isPlainObject, simpleClone, toArray } from '@pengzhanbo/utils'
  import { ofetch } from 'ofetch'
  import { compile, pathToRegexp } from 'path-to-regexp'
  import { t } from '../lib/i18n.svelte'
  import { store } from '../lib/store.svelte'
  import { cn } from '../utils/cn'
  import { keyValueToObj, keyValueToUrlSearchParams, objToKeyValue } from '../utils/keyValue'
  import IconRemove from './IconRemove.svelte'
  import KeyValueEditor from './KeyValueEditor.svelte'
  import RequestBody from './RequestBody.svelte'
  import ResponseView from './ResponseView.svelte'

  const config = $derived(store.testing)

  const contentType: Record<TestRequest['bodyType'], string> = {
    'raw': 'application/json',
    'form-data': 'multipart/form-data',
    'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
    'binary': 'application/octet-stream',
  }

  $effect(() => {
    document.body.style.overflow = config ? 'hidden' : ''
  })

  const closeTesting = () => store.testing = null
  const onkeydown = (e: KeyboardEvent) => e.key === 'Escape' && (store.testing = null)

  const isDynamic = $derived(config?.url ? /[:{}*]/.test(config.url) : false)
  const methods = $derived(toArray(config?.method || ['GET', 'POST']))
  const _default: TestRequest = {
    url: '',
    method: '',
    body: { 'raw': '', 'form-data': [], 'x-www-form-urlencoded': [] },
    bodyType: 'raw',
    query: [],
    params: [],
    headers: [
      { key: 'content-type', value: 'application/json', type: 'text' },
    ],
  }
  let request: TestRequest = $state(simpleClone(_default))

  let response: TestResponse | null = $state(null)

  $effect(() => {
    if (!config) {
      request = simpleClone(_default)
      return
    }
    const validator = isPlainObject(config.validator) ? config.validator : {}
    const params = { ...validator.params }
    if (isDynamic) {
      const [pathname] = config.url.split('?')
      const { keys } = pathToRegexp(pathname)
      keys.forEach((key) => {
        params[key.name] = params[key.name] || ''
      })
    }
    request.url = config.url || ''
    request.method = methods[0] ?? 'GET'
    if ('body' in validator) {
      request.body.raw = JSON.stringify(validator.body, null, 2)
    }
    request.query = objToKeyValue(validator.query)
    request.params = objToKeyValue(params)
  })

  const requestURL = $derived.by(() => {
    if (!request.url)
      return ''
    let url = request.url
    if (isDynamic) {
      try {
        const [pathname, search] = request.url.split('?')
        url = compile(pathname)(keyValueToObj(request.params)) + (search ? `?${search}` : '')
      }
      catch {}
    }
    return keyValueToUrlSearchParams(url, request.query)
  })

  $effect(() => {
    if (!config)
      response = null
  })

  $effect(() => {
    let item = request.headers.find(item => item.key.toLowerCase() === 'content-type')
    if (!item) {
      item = { key: 'content-type', value: '', type: 'text' }
      request.headers.unshift(item)
    }
    if (request.bodyType === 'binary') {
      item.value = request.body.binary?.[0]?.type || contentType[request.bodyType]
    }
    else {
      item.value = contentType[request.bodyType]
    }
  })

  const tabs = $derived([isDynamic ? 'Params' : undefined, 'Query', 'Body', 'Headers'].filter(Boolean)) as string[]
  let currentTab = $state('')
  $effect(() => {
    currentTab = isDynamic ? 'Params' : 'Query'
  })

  function tabClass(tab: string) {
    return cn('border border-divider rounded-b-md p-4', currentTab === tab ? 'block' : 'hidden')
  }

  const NO_BODY_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE']

  const onSend = async () => {
    const start = Date.now()
    let url = request.url
    if (isDynamic) {
      try {
        const [pathname, search] = request.url.split('?')
        url = compile(pathname)(keyValueToObj(request.params)) + (search ? `?${search}` : '')
      }
      catch (error) {
        console.error(error)
        return
      }
    }
    let body: BodyInit = ''
    if (request.bodyType === 'raw') {
      body = request.body.raw || ''
    }
    else if (request.bodyType === 'form-data') {
      body = new FormData()
      request.body['form-data']?.forEach((item) => {
        if (typeof item.value === 'string') {
          (body as FormData).append(item.key, item.value)
        }
        else if (item.value instanceof FileList) {
          for (const file of item.value)
            (body as FormData).append(item.key, file)
        }
      })
    }
    else if (request.bodyType === 'x-www-form-urlencoded') {
      body = new URLSearchParams()
      request.body['x-www-form-urlencoded']?.forEach((item) => {
        item.type === 'text' && (body as URLSearchParams).append(item.key, item.value as string)
      })
    }
    else if (request.bodyType === 'binary') {
      body = request.body.binary?.[0] || ''
    }
    await ofetch(url, {
      method: request.method,
      body: NO_BODY_METHODS.includes(request.method) ? undefined : body,
      query: keyValueToObj(request.query),
      headers: keyValueToObj(request.headers),
      retry: false,
      onResponse: async (res) => {
        const result: TestResponse = {}
        result.status = res.response.status
        result.statusText = res.response.statusText
        result.headers = Object.fromEntries(res.response.headers.entries())
        const type = result.headers['content-type']?.toLowerCase() || ''
        result.body = res.response._data
        if (type.includes('application/json')) {
          result.type = 'json'
        }
        else if (type.includes('text/')) {
          result.type = 'text'
        }
        else if (type.includes('image/') || type.includes('video/') || type.includes('audio/') || type.includes('application/pdf')) {
          result.type = 'blob'
        }
        else {
          result.type = 'unknown'
        }
        result.timestamp = Date.now() - start
        response = result
      },
    })
  }
</script>

{#if config}
  <div
    class='fixed inset-0 p-4 bg-gray-950/45 z-30'
    role='dialog'
    aria-modal={!!config}
    aria-labelledby='testing-dialog'
    tabindex='-1'
    onclick={closeTesting}
    onkeydown={onkeydown}
  ></div>
  <div
    class='fixed w-full max-w-[calc(100vw-40px)] xl:max-w-240 max-h-[calc(100vh-128px)] inset-0 z-40 m-auto bg-background rounded-md flex flex-col drop-shadow-2xl'
  >
    <div class='pl-4 pr-2 h-12 flex items-center justify-between border-b border-divider'>
      <h3>{config.url}</h3>
      <button
        class='text-gray-600 dark:text-gray-300 px-2 py-1 cursor-pointer'
        onclick={closeTesting}
      ><IconRemove /></button>
    </div>
    <div class='flex-1 min-w-0 overflow-y-auto p-4'>
      <div class='flex items-center'>
        <select name='method' class='w-20 h-10 px-2 leading-10 border border-divider border-r-0 rounded-l-md focus:outline-none' bind:value={request.method}>
          {#each methods as method}
            <option value={method}>{method}</option>
          {/each}
        </select>
        <input
          type='text' name='url'
          class='flex-1 h-10 leading-10 border border-r-0 border-divider px-4 focus:border-primary focus:outline-none'
          bind:value={request.url}
        />
        <button
          type='button'
          class='h-10 leading-10 px-4 bg-primary text-white rounded-r-md cursor-pointer'
          onclick={() => onSend()}
        >{t('send')}</button>
      </div>

      <div class='text-gray-400 dark:text-gray-500'>
        <span>Request URL:</span>
        <span class='text-primary'>{requestURL}</span>
      </div>

      <div class='mt-4 flex items-center gap-4'>
        {#each tabs as tab}
          <button
            class={cn(
              'border border-divider border-b-0 rounded-t-md px-4 py-1 cursor-pointer',
              tab === currentTab && 'bg-primary text-white border-primary',
            )}
            onclick={() => currentTab = tab}
          >{tab}</button>
        {/each}
      </div>
      <KeyValueEditor bind:items={request.params} immutable disableKey class={tabClass('Params')} />
      <KeyValueEditor bind:items={request.query} class={tabClass('Query')} />
      <RequestBody bind:bodyType={request.bodyType} bind:body={request.body} class={tabClass('Body')} />
      <KeyValueEditor items={request.headers} class={tabClass('Headers')} />
      {#if response}
        <ResponseView response={response} />
      {/if}
    </div>
  </div>
{/if}
