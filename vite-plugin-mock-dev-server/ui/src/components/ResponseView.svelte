<script lang='ts'>
  import type { TestResponse } from '../types'
  import { clsx as cn } from 'clsx'
  import { t } from '../lib/i18n.svelte'
  import CodeView from './CodeView.svelte'

  const { response }: { response: TestResponse } = $props()

  let current: string = $state('body')
  const tabs = [{ label: 'Body', value: 'body' }, { label: 'Header', value: 'header' }]

  const size = $derived.by(() => {
    const length = response.headers?.['content-length']
    if (length) {
      return (Number(length) / 1024).toFixed(2)
    }
    if (response.body) {
      try {
        const size = new Blob([JSON.stringify(response.body)]).size
        return (size / 1024).toFixed(2)
      }
      catch {}
    }
    return ''
  })

  const blobUrl = $derived.by(() => {
    if (response.type === 'blob' && response.body instanceof Blob) {
      return URL.createObjectURL(response.body)
    }
    return null
  })
</script>

<h3 class='font-bold mt-6'>
  {response.error ? t('error') : t('response')}:
</h3>

<div class='w-full border border-divider rounded-md p-4 mt-4'>
  {#if response.error}
    <div class='text-red-500'>
      <div class='flex items-center gap-2'>
        <span class='font-bold'>{response.error.type.toUpperCase()}</span>
        <span>{response.error.message}</span>
      </div>
    </div>
  {:else}
    <div class='flex items-center justify-between'>
      <div class='flex items-center gap-4'>
        {#each tabs as { label, value }, index}
          <button
            class={cn(
              'cursor-pointer',
              { 'text-primary': value === current },
            )}
            onclick={() => current = value}
          >{label}</button>
          {#if index < tabs.length - 1}
            <span class='inline-block w-px h-6 bg-divider'></span>
          {/if}
        {/each}
      </div>
      <div class='flex items-center gap-4'>
        {#if response.status}
          <span class={cn({
            'text-red-500': response.status >= 400,
            'text-green-500': response.status >= 200 && response.status < 400,
          })}>{response.status} {response.statusText}</span>
        {/if}
        {#if response.timestamp}
          <span class='inline-block w-px h-6 bg-divider'></span>
          <span>{response.timestamp}ms</span>
        {/if}
        {#if size}
          <span class='inline-block w-px h-6 bg-divider'></span>
          <span>{size}KB</span>
        {/if}
      </div>
    </div>
    {#if response.body && current === 'body'}
      {#if response.type === 'json' || response.type === 'text'}
        <CodeView code={response.body} />
      {:else if response.type === 'blob' && blobUrl}
        <a href={blobUrl} download>{t('download')}</a> Blob Asset
      {/if}
    {/if}
    {#if response.headers && current === 'header'}
      <CodeView code={response.headers} />
    {/if}
  {/if}

</div>
