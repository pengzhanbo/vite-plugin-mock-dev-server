<script lang='ts'>
  import type { TestResponse } from '../types'
  import { cn } from '../utils/cn'
  import CodeView from './CodeView.svelte'

  const { response }: { response: TestResponse } = $props()
  const timestamp = $derived.by(() => {
    if (response.timestamp) {
      return `${response.timestamp}ms`
    }
    return ''
  })
  const size = $derived.by(() => {
    const length = response.headers?.['content-length']
    if (length) {
      return `${(Number(length) / 1024).toFixed(2)}KB`
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

<h3 class='font-bold mt-6'>Response: </h3>

<div class='w-full border border-divider rounded-md p-4 mt-4'>
  <div class='flex items-center justify-between'>
    <h4 class='font-bold'>Body</h4>
    <div class='flex items-center gap-4'>
      {#if response.status}
        <span class={cn({
          'text-red-500': response.status >= 400,
          'text-green-500': response.status >= 200 && response.status < 400,
        })}>{response.status} {response.statusText}</span>
      {/if}
      {#if timestamp}
        <span class='inline-block w-px h-6 bg-divider'></span>
        <span>{timestamp}</span>
      {/if}
      {#if size}
        <span class='inline-block w-px h-6 bg-divider'></span>
        <span>{size}</span>
      {/if}
    </div>
  </div>
  {#if response.body}
    {#if response.type === 'json' || response.type === 'text'}
      <CodeView code={response.body} />
    {:else if response.type === 'blob' && blobUrl}
      <a href={blobUrl} download>Download</a> Blob Asset
    {/if}
  {/if}

</div>
