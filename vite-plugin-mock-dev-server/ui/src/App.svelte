<script lang='ts'>
  import Navbar from './components/Navbar.svelte'
  import Panel from './components/Panel.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import Testing from './components/Testing.svelte'
  import { setupData } from './lib/data.svelte'
  import { setupStore } from './lib/store.svelte'

  setupStore()
  setupData()
</script>

<Navbar />

<main class='mt-14 w-full min-h-[calc(100vh-56px)]'>
  <Sidebar />
  <div class='flex-1 min-w-0 w-full min-h-full pl-(--sidebar-width)'>
    <Panel />
  </div>
</main>

<Testing />
