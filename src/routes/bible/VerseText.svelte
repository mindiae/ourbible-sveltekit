<script lang="ts">
  interface TextData {
    name: string;
    data?: string;
    S?: string;
    m?: string;
  }
  export let data: TextData[];
</script>

<span>
  {#each data?.filter((word) => !!word.data) as word, key (`${word.data}${key}`)}
    {#if word.name == 'word'}
      <span>
        {#if key != 0}
          {' '}
        {/if}
        <a href="https://biblehub.com/greek/{word.S}.htm" target="_blank">{word.data}</a>
      </span>
    {:else if word.name == 'punctuation'}
      <span>{word.data}</span>
    {/if}
  {/each}
</span>
