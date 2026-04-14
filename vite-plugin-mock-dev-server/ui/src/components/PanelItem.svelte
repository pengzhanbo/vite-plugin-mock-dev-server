<script lang='ts'>
  import type { MockItem } from '../types'
  import { toArray } from '@pengzhanbo/utils'
  import { clsx as cn } from 'clsx'
  import { modifyData } from '../lib/data.svelte'
  import { t } from '../lib/i18n.svelte'
  import { store } from '../lib/store.svelte'
  import { fetchMockApi } from '../utils/fetch'
  import CodeView from './CodeView.svelte'
  import DelayEditor from './DelayEditor.svelte'
  import FieldBlock from './FieldBlock.svelte'
  import FieldInline from './FieldInline.svelte'
  import Switch from './Switch.svelte'

  const { config }: { config: MockItem } = $props()

  const colors: Record<string, string> = {
    GET: cn('bg-blue-400'),
    POST: cn('bg-green-400'),
    PUT: cn('bg-yellow-400'),
    DELETE: cn('bg-red-400'),
    HEAD: cn('bg-purple-400'),
    OPTIONS: cn('bg-gray-500'),
    TRACE: cn('bg-gray-300'),
    CONNECT: cn('bg-black-300'),
  }

  const methods = $derived(toArray(config.method ?? ['GET', 'POST']))

  const launchEditor = () => fetchMockApi('launch-editor', {
    query: {
      file: encodeURIComponent(config.__filepath__),
    },
  })

  const openTesting = () => store.testing = config
  const toggleEnabled = () => {
    modifyData(config.__filepath__, config.__hash__, { enabled: !config.enabled })
  }

</script>

<section class='text-gray-600 dark:text-gray-400 border border-divider rounded-md transition-colors'>
  <div class='flex items-center justify-between gap-4 w-full px-4 h-10 border-b border-divider transition-colors'>
    <p class='flex item-center gap-2 flex-1 min-w-0'>
      {#each methods as method}
        <span class={cn(colors[method], 'px-1 rounded text-white text-[14px] leading-6')}>{method}</span>
      {/each}
      <span class='flex-1 min-w-0'>{config.url}</span>
    </p>
    {#if config.enabled}
      <button class=' text-primary cursor-pointer' onclick={openTesting}>[{t('test')}]</button>
    {/if}
    <span class={cn({ 'text-green-500': config.enabled, 'text-gray-400': !config.enabled })}>{config.enabled ? t('enabled') : t('disabled')}</span>
    <Switch checked={config.enabled} onclick={toggleEnabled} />
  </div>

  {#if config.validator}
    <div class='p-4 border-b border-divider transition-colors'>
      <p class='flex item-center gap-2'>
        <span class=' text-yellow-500 dark:text-yellow-400 font-bold'>Request Validator:</span>
        {#if config.validator === '<function>'}
          <span class='text-gray-500 dark:text-gray-400'>{config.validator}</span>
        {/if}
      </p>
      {#if config.validator !== '<function>'}
        <CodeView code={config.validator} class='ml-4' />
      {/if}
    </div>
  {/if}

  <div class='p-4'>
    <FieldInline field={config.status || 200} label='Status'>
      {#snippet children(status)}
        <span>{status}</span>
        {#if config.statusText}
          <span class='text-sm text-gray-500 dark:text-gray-400'>({config.statusText})</span>
        {/if}
      {/snippet}
    </FieldInline>

    <FieldInline field={config.delay} label='Delay'>
      {#snippet children(delay)}
        <DelayEditor delay={delay} />
      {/snippet}
    </FieldInline>

    <FieldBlock field={config.headers} label='Headers'>
      {#snippet children(headers)}
        <CodeView code={headers} class='ml-4' />
      {/snippet}
    </FieldBlock>

    <FieldBlock field={config.cookies} label='Cookies'>
      {#snippet children(cookies)}
        <CodeView code={cookies} class='ml-4' />
      {/snippet}
    </FieldBlock>

    <FieldBlock field={config.body} label='Body'>
      {#snippet children(body)}
        <CodeView code={body} class='ml-4' />
      {/snippet}
    </FieldBlock>
    <FieldBlock field={config.response} label='Response'>
      {#snippet children(response)}
        <CodeView code={response} class='ml-4' />
      {/snippet}
    </FieldBlock>
  </div>

  {#if config.error}
    <div class='p-4 border-t border-divider transition-colors'>
      <p class='flex item-center gap-2 mb-4'>
        <span class=' text-red-500 dark:text-red-400 font-bold'>Response Error:</span>
      </p>
      <div class='pl-4'>
        <FieldInline field={config.error.probability ?? 0.5} label='Probability'>
          {#snippet children(probability)}
            <span>{probability}</span>
          {/snippet}
        </FieldInline>
        <FieldInline field={config.error.status} label='Error Status'>
          {#snippet children(status)}
            <span>{status}</span>
            {#if config.error?.statusText}
              <span class='text-sm text-gray-500 dark:text-gray-400'>({config.error.statusText})</span>
            {/if}
          {/snippet}
        </FieldInline>
        <FieldBlock field={config.error.body} label='Error Body'>
          {#snippet children(errorBody)}
            <CodeView code={errorBody} class='ml-4' />
          {/snippet}
        </FieldBlock>
      </div>
    </div>
  {/if}

  <div class='flex items-center justify-end gap-4 w-full px-4 h-10 border-t border-divider transition-colors'>
    <span class='underline text-gray-400 dark:text-gray-600'>{config.__filepath__}</span>
    <button onclick={launchEditor} class='text-primary cursor-pointer'>[{t('launchEditor')}]</button>
  </div>
</section>
