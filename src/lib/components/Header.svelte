<script>
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Bible', href: '/bible' },
    { name: 'contact', href: '/contact' }
  ];

  let showingNavigationDropdown = false;
</script>

<header class="bg-gray-800 text-white">
  <nav>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="font-bold text-2xl font-['Helvetica']">OurBible</a>
        <div class="flex">
          <ul class="hidden space-x-2 sm:-my-px sm:ml-10 sm:flex font-['Archy_EDT'] tracking-wider">
            {#each navigation as item}
              <li>
                <a href={item.href} class="ml-4 hover:text-gray-300">{item.name}</a>
              </li>
            {/each}
          </ul>

          <!-- Hamburger -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition"
              on:click={() => (showingNavigationDropdown = !showingNavigationDropdown)}
            >
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  class={showingNavigationDropdown ? 'hidden' : 'inline-flex'}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  class={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Responsive Navigation Menu -->
      <div class="{showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden">
        <ul class="pt-2 pb-3 space-y-1">
          {#each navigation as item}
            <li>
              <a href={item.href} class="ml-4 hover:text-gray-300">{item.name}</a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </nav>
</header>
