<script lang='ts'>
  import { isArray } from '@pengzhanbo/utils'
  import { t } from '../lib/i18n.svelte'

  let { delay = $bindable<number | [number, number] | undefined>(undefined) }: {
    delay?: number | [number, number]
  } = $props()

  let isEditing = $state(false)
  let editMode = $state<'single' | 'range'>('single')
  let singleValue = $state(0)
  let rangeStart = $state(0)
  let rangeEnd = $state(0)

  function enterEdit() {
    if (typeof delay === 'undefined') {
      editMode = 'single'
      singleValue = 0
      rangeStart = 0
      rangeEnd = 0
    }
    else if (isArray(delay)) {
      editMode = 'range'
      rangeStart = delay[0]
      rangeEnd = delay[1]
    }
    else {
      editMode = 'single'
      singleValue = delay
    }
    isEditing = true
  }

  function save() {
    delay = editMode === 'single' ? singleValue : [rangeStart, rangeEnd]
    isEditing = false
  }

  function cancel() {
    isEditing = false
  }

  function remove() {
    delay = undefined
    isEditing = false
  }
</script>

<div class='flex items-center gap-2'>
  {#if isEditing}
    <div class='flex items-center gap-2'>
      <select
        class='px-2 py-1 rounded border border-divider focus:outline-none focus:border-primary'
        bind:value={editMode}
      >
        <option value='single'>{t('editor.delay.single')}</option>
        <option value='range'>{t('editor.delay.range')}</option>
      </select>

      {#if editMode === 'single'}
        <input
          type='number'
          min='0'
          class='w-20 px-2 py-1 rounded border border-divider focus:outline-none focus:border-primary'
          bind:value={singleValue}
        />
        <span class='text-gray-500'>ms</span>
      {:else}
        <input
          type='number'
          min='0'
          class='w-20 px-2 py-1 rounded border border-divider focus:outline-none focus:border-primary'
          bind:value={rangeStart}
        />
        <span class='text-gray-500'>-</span>
        <input
          type='number'
          min='0'
          class='w-20 px-2 py-1 rounded border border-divider focus:outline-none focus:border-primary'
          bind:value={rangeEnd}
        />
        <span class='text-gray-500'>ms</span>
      {/if}

      <button
        class='px-2 py-1 text-sm rounded bg-primary text-white cursor-pointer'
        onclick={save}
      >
        {t('save')}
      </button>
      <button
        class='px-2 py-1 text-sm rounded border border-divider cursor-pointer'
        onclick={cancel}
      >
        {t('cancel')}
      </button>
      {#if delay !== undefined}
        <button
          class='px-2 py-1 text-sm text-red-500 border border-red-500 rounded cursor-pointer'
          onclick={remove}
        >
          {t('remove')}
        </button>
      {/if}
    </div>
  {:else}
    <span class='text-gray-600 dark:text-gray-400'>
      {typeof delay === 'undefined' ? '-' : isArray(delay) ? `${delay[0]} - ${delay[1]} ms` : `${delay} ms`}
    </span>
    <button
      class='text-sm text-primary cursor-pointer'
      onclick={enterEdit}
    >
      {t('editor.delay.set')}
    </button>
  {/if}
</div>
