<h1>You found the super secret page!</h1>
<p>Here's the secret: { JSON.stringify($page.params) }</p>

<script lang="ts">
  import { page } from '$app/stores';
  console.log($page.params)
</script>
