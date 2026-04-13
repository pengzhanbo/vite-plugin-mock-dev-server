<script lang='ts'>
  interface Props {
    checked?: boolean
    disabled?: boolean
    onclick?: () => void
  }

  const { checked = false, disabled = false, onclick }: Props = $props()

  function toggle() {
    if (disabled)
      return
    onclick?.()
  }
</script>

<button
  type='button'
  role='switch'
  aria-checked={checked}
  aria-label='switch'
  {disabled}
  onclick={toggle}
  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 {checked ? 'bg-green-600' : 'bg-gray-200'} {disabled ? 'cursor-not-allowed opacity-50' : ''}"
>
  <span
    aria-hidden='true'
    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {checked ? 'translate-x-5' : 'translate-x-0'}"
  ></span>
</button>
