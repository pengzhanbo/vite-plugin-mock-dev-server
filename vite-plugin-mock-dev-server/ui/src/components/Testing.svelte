<script lang='ts'>
  import type { TestRequest, TestResponse } from '../types'
  import { isPlainObject, simpleClone, toArray } from '@pengzhanbo/utils'
  import { clsx as cn } from 'clsx'
  import { compile, pathToRegexp } from 'path-to-regexp'
  import { t } from '../lib/i18n.svelte'
  import { store } from '../lib/store.svelte'
  import { fetchMock } from '../utils/fetch'
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
  let isLoading = $state(false)

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

  const tabs = $derived([isDynamic ? 'Param' : undefined, 'Query', 'Body', 'Header'].filter(Boolean)) as string[]
  let currentTab = $state('')
  $effect(() => {
    currentTab = isDynamic ? 'Param' : 'Query'
  })

  function tabClass(tab: string) {
    return cn('border border-divider rounded-b-md p-4', currentTab === tab ? 'block' : 'hidden')
  }

  const NO_BODY_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE']

  const onSend = async () => {
    const start = Date.now()
    isLoading = true
    response = null
    let url = request.url
    if (isDynamic) {
      try {
        const [pathname, search] = request.url.split('?')
        url = compile(pathname)(keyValueToObj(request.params)) + (search ? `?${search}` : '')
      }
      catch (error) {
        console.error(error)
        isLoading = false
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
    const referrer = new URL(window.location.href)
    if (isPlainObject(config?.validator) && config.validator.refererQuery) {
      Object.entries(config.validator.refererQuery).forEach(([key, value]) => {
        referrer.searchParams.append(key, value)
      })
    }

    try {
      const res = await fetchMock(url, {
        method: request.method,
        body: NO_BODY_METHODS.includes(request.method) ? undefined : body,
        query: keyValueToObj(request.query),
        headers: keyValueToObj(request.headers),
        referrer: referrer.toString(),
      })
      const result: TestResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
      }
      if (res.ok) {
        const type = result.headers?.['content-type']?.toLowerCase() || ''
        if (type.includes('application/json')) {
          result.type = 'json'
          result.body = await res.json()
        }
        else if (type.includes('text/')) {
          result.type = 'text'
          result.body = await res.text()
        }
        else if (type.includes('image/') || type.includes('video/') || type.includes('audio/') || type.includes('application/pdf')) {
          result.type = 'blob'
          result.body = await res.blob()
        }
        else {
          result.type = 'unknown'
          result.body = await res.text()
        }
      }
      result.timestamp = Date.now() - start
      response = result
    }
    catch (error) {
      const result: TestResponse = {
        timestamp: Date.now() - start,
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'DOMException') {
          result.error = {
            type: 'abort',
            message: t('networkError'),
          }
        }
        else if (error.message.includes('timeout')) {
          result.error = {
            type: 'timeout',
            message: t('timeout'),
          }
        }
        else if (error.message.includes('network') || error.message.includes('fetch') || error.cause instanceof TypeError) {
          result.error = {
            type: 'network',
            message: t('networkError'),
          }
        }
        else {
          result.error = {
            type: 'unknown',
            message: error.message || t('unknownError'),
          }
        }
      }
      else {
        result.error = {
          type: 'unknown',
          message: t('unknownError'),
        }
      }
      response = result
    }
    finally {
      isLoading = false
    }
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
          class='h-10 leading-10 px-4 bg-primary text-white rounded-r-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading}
          onclick={() => onSend()}
        >{isLoading ? t('loading') : t('send')}</button>
      </div>

      <div class='text-gray-400 dark:text-gray-500'>
        <span>{t('requestUrl')}:</span>
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
      <KeyValueEditor bind:items={request.params} immutable disableKey class={tabClass('Param')} />
      <KeyValueEditor bind:items={request.query} class={tabClass('Query')} />
      <RequestBody bind:bodyType={request.bodyType} bind:body={request.body} class={tabClass('Body')} />
      <KeyValueEditor items={request.headers} class={tabClass('Header')} />
      {#if response}
        <ResponseView response={response} />
      {/if}
    </div>
  </div>
{/if}
