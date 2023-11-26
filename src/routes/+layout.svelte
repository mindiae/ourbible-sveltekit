<script>
  import '../app.css';
  import '$lib/assets/css/fonts.css'
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Header />

<div class="min-h-[100vh]">
  <slot />
</div>

<Footer />
