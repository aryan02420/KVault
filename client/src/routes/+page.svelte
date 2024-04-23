<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={handleClick}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<script lang="ts">
  // counter
  let count = 0;

  // increment the count
  function handleClick() {
    count += 1;
  }
</script>
