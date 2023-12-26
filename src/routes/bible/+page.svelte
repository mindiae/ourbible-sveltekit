<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import ChevronDown from './ChevronDown.svelte';
  import ChevronLeft from './ChevronLeft.svelte';
  import ChevronRight from './ChevronRight.svelte';
  import VerseText from './VerseText.svelte';
  import Xmark from './Xmark.svelte';

  type BibleModuleInfo = {
    description: string;
    chapter_string: string;
    language: string;
    language_iso639_2b: string;
    russian_numbering: string;
    strong_numbers: string;
    right_to_left: string;
    detailed_info: string;
    introduction_string: string;
    history_of_changes: string;
  };

  type BibleModuleBooks = {
    [bookNumber: string]: [number, string, string, string];
  };

  type BibleModule = {
    info: BibleModuleInfo;
    books: BibleModuleBooks;
  };

  type BibleModules = {
    [moduleName: string]: BibleModule;
  };

  interface TextData {
    name: string;
    data?: string;
    S?: string;
    m?: string;
  }

  interface Verse {
    verse: number;
    text: string | TextData[];
  }

  interface Chapter {
    [key: string]: Verse;
  }

  interface Meta {
    connection: string;
    book_number: number;
    chapter_number: number;
    previous_chapter: null | { connection: string; book_number: number; chapter: number };
    next_chapter: null | { connection: string; book_number: number; chapter: number };
  }

  interface Data {
    chapter: Chapter;
    meta: Meta;
  }

  const urlParams = $page.url.searchParams;

  let default_module = 'NTPT+';
  let modules_obj: BibleModules;
  let uiModule: string;
  let versesData: { [verses: string]: Data } = {};
  let pickedModules = [default_module, '', ''];
  let bookNumber: number;
  let chapterNumber: number;
  let startVerseNumber: number;
  let endVerseNumber: number;

  onMount(async () => {
    const response = await fetch('/bibles/modules.json');
    modules_obj = (await response.json()) as BibleModules;

    const tmpUiModule = urlParams.get('t') ?? '';
    uiModule = !!modules_obj[tmpUiModule] ? tmpUiModule : default_module;

    const tmpFirstPickedModule = urlParams.get('a1') ?? '';
    pickedModules[0] = !!modules_obj[tmpFirstPickedModule]
      ? tmpFirstPickedModule
      : pickedModules[0];

    const tmpSecondPickedModule = urlParams.get('a2') ?? '';
    pickedModules[1] = !!modules_obj[tmpSecondPickedModule] ? tmpSecondPickedModule : '';

    const tmpThirdPickedModule = urlParams.get('a3') ?? '';
    pickedModules[2] = !!modules_obj[tmpThirdPickedModule] ? tmpThirdPickedModule : '';

    const tmpBookNumber = urlParams.get('b') ?? '470';
    bookNumber = !!modules_obj[uiModule].books[parseInt(tmpBookNumber)]
      ? parseInt(tmpBookNumber)
      : 470;

    const tmpChapterNumber = urlParams.get('c') ?? '';
    chapterNumber =
      modules_obj &&
      Array.from(
        { length: modules_obj[uiModule].books[parseInt(tmpBookNumber)][0] },
        (_, i) => i + 1
      ).includes(parseInt(tmpChapterNumber))
        ? parseInt(tmpChapterNumber)
        : 1;

    const tmpStartVerseNumber = urlParams.get('i') || '';
    startVerseNumber = parseInt(tmpStartVerseNumber);
    const tmpEndveVerseNumber = urlParams.get('e') || '';
    endVerseNumber = parseInt(tmpEndveVerseNumber);

    moveToOtherPlace();
    pickedModules = pickedModules;
  });

  const moveToOtherPlace = () => {
    for (let module of Object.keys(modules_obj)) {
      if (!!modules_obj[module].books[bookNumber]) {
        fetch(`/bibles/${module}/${bookNumber}/${chapterNumber}.json`)
          .then((response) => response.json())
          .then((data) => {
            versesData[module] = data;
            versesData = versesData;
            if (Object.keys(modules_obj).slice(-1)[0] === module) {
              setUrlParams();
            }
          });
      }
    }
  };

  let showingBooksDropdown = false;
  let showingChaptersDropdown = false;
  let showingModulesDropdown = false;
  let showingAddModuleDropdown = false;

  const buttonClass =
    'inline-flex bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 shadow align-middle leading-[1em] disabled:opacity-50';

  const setUrlParams = () => {
    let params = new URLSearchParams($page.url.searchParams.toString());

    params.set('b', bookNumber?.toString());
    params.set('c', chapterNumber?.toString());
    params.set('t', uiModule);

    if (startVerseNumber) {
      params.set('i', startVerseNumber.toString());
    } else {
      params.delete('i');
    }

    if (endVerseNumber) {
      params.set('e', endVerseNumber.toString());
    } else {
      params.delete('e');
    }

    params.set('a1', pickedModules[0]);

    if (pickedModules[1]) {
      params.set('a2', pickedModules[1]);
    } else {
      params.delete('a2');
    }

    if (pickedModules[2]) {
      params.set('a3', pickedModules[2]);
    } else {
      params.delete('a3');
    }

    if (browser) {
      window.history.replaceState(
        {},
        '',
        `${$page.url.pathname}?${params.toString()}${$page.url.hash}`
      );
    }
  };

  $: if (startVerseNumber && !endVerseNumber) {
    endVerseNumber = startVerseNumber;
  }

  $: {
    if (!pickedModules[0]) {
      pickedModules.push(uiModule);
      pickedModules = pickedModules;
    }
    if (!pickedModules.includes(uiModule)) {
      uiModule = pickedModules[0];
    }
  }

  $: if (!!pickedModules[2]) {
    showingAddModuleDropdown = false;
  }

  $: if (pickedModules.filter((module) => !!module)) {
    setUrlParams();
  }

  const goToPreviousChapter = () => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    const previousChapterBook = versesData[pickedModules[0]]?.meta?.previous_chapter?.book_number;
    const previousChapter = versesData[pickedModules[0]]?.meta?.previous_chapter?.chapter;
    chapterNumber = 1;
    bookNumber = previousChapterBook ?? bookNumber;
    chapterNumber = previousChapter ?? chapterNumber;
    moveToOtherPlace();
    return undefined;
  };

  const goToNextChapter = () => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    const nextChapterBook = versesData[pickedModules[0]]?.meta?.next_chapter?.book_number;
    const nextChapter = versesData[pickedModules[0]]?.meta?.next_chapter?.chapter;
    chapterNumber = 1;
    bookNumber = nextChapterBook ?? bookNumber;
    chapterNumber = nextChapter ?? chapterNumber;
    moveToOtherPlace();
    return undefined;
  };

  const goToBook = (book_number: number) => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    chapterNumber = 1;
    bookNumber = book_number;
    moveToOtherPlace();
    return undefined;
  };

  const goToChapter = (chapter_number: number) => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    chapterNumber = chapter_number;
    moveToOtherPlace();
    return undefined;
  };
</script>

<div>
  <div class="flex">
    {#each pickedModules.filter((module) => !!module) as module, moduleNumber (moduleNumber)}
      <div class="flex-1 py-2">
        <button
          on:click={() => {
            uiModule = module;
            showingChaptersDropdown = false;
            showingBooksDropdown = false;
            showingAddModuleDropdown = false;
            showingModulesDropdown = !showingModulesDropdown;
          }}
          class="{buttonClass} rounded-l"
        >
          {#if !!modules_obj}
            {module}
          {/if}
          <ChevronDown class="ml-2" />
        </button>

        <!-- show books toggle -->
        <button
          on:click={() => {
            uiModule = module;
            showingChaptersDropdown = false;
            showingModulesDropdown = false;
            showingAddModuleDropdown = false;
            showingBooksDropdown = !showingBooksDropdown;
          }}
          class={buttonClass}
        >
          {#if !!modules_obj && modules_obj[module]?.books[bookNumber]}
            {modules_obj[module].books[bookNumber][2]}
          {:else}
            {'=='}
          {/if}

          <ChevronDown class="ml-2" />
        </button>

        <!-- show chapters toggle -->
        <button
          on:click={() => {
            uiModule = module;
            showingAddModuleDropdown = false;
            showingModulesDropdown = false;
            showingBooksDropdown = false;
            showingChaptersDropdown = !showingChaptersDropdown;
          }}
          class="{buttonClass} rounded-r"
        >
          {chapterNumber ?? ' '}
          <ChevronDown class="ml-2" />
        </button>

        {#if pickedModules.filter((module) => !!module).slice(-1)[0] == module && !pickedModules[2]}
          <button
            on:click={() => {
              showingBooksDropdown = false;
              showingChaptersDropdown = false;
              showingModulesDropdown = false;
              showingAddModuleDropdown = !showingAddModuleDropdown;
            }}
            class="{buttonClass} rounded"
          >
            +
            <ChevronDown class="ml-2" />
          </button>
        {:else if pickedModules.filter((module) => !!module).length > 1}
          <button
            on:click={() => {
              pickedModules.splice(pickedModules.indexOf(module), 1);
              pickedModules.push('');
              pickedModules = pickedModules;
            }}
            class="{buttonClass} rounded"
          >
            <Xmark />
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#if showingModulesDropdown}
    <ul class="flex flex-col border rounded-l my-1">
      {#each Object.entries(modules_obj).filter(([name]) => !pickedModules.includes(name)) as [moduleName, module] (moduleName)}
        <li>
          <button
            on:click={() => {
              pickedModules[pickedModules.indexOf(uiModule)] = moduleName;
              pickedModules = pickedModules;
            }}
            class="{buttonClass} rounded-md w-full"
          >
            {moduleName}
            {module.info.description}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if showingAddModuleDropdown && !pickedModules[2]}
    <ul class="flex flex-col border rounded-l my-1">
      {#each Object.entries(modules_obj).filter(([name]) => !pickedModules.includes(name)) as [moduleName, module] (moduleName)}
        <li>
          <button
            on:click={() => {
              pickedModules[pickedModules.indexOf('')] = moduleName;
              pickedModules = pickedModules;
            }}
            class="{buttonClass} rounded-md w-full"
          >
            {moduleName}
            {module.info.description}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- books -->
  <div class={showingBooksDropdown ? 'block' : 'hidden'}>
    {#if !!modules_obj && !!modules_obj[uiModule]}
      {#each Object.entries(modules_obj[uiModule].books) as [book_number, book] (book_number)}
        {#if parseInt(book_number) == 470}
          <br class="first:hidden" />
        {/if}
        <button
          on:click={() => goToBook(parseInt(book_number))}
          class="border rounded px-2 disabled:font-bold"
          style="background-color: {book[1]};"
          disabled={parseInt(book_number) === bookNumber}
        >
          {book[2]}
        </button>
      {/each}
    {/if}
  </div>

  <!-- chapters per book -->
  {#if !!modules_obj && !!modules_obj[uiModule]?.books[bookNumber]}
    <div class={showingChaptersDropdown ? 'block' : 'hidden'}>
      {#each Array.from({ length: modules_obj[uiModule].books[bookNumber][0] }, (_, i) => i + 1) as chapter_number (chapter_number)}
        <button
          on:click={() => goToChapter(chapter_number)}
          class="bg-gray-600
               disabled:bg-gray-900
               text-white border
               rounded px-2"
          disabled={chapter_number == chapterNumber}
        >
          {chapter_number}
        </button>
      {/each}
    </div>
  {/if}

  <article>
    <div class="flex">
      {#each pickedModules.filter((module) => !!module) as module (module)}
        <div class="flex-1">
          {#if !!modules_obj && modules_obj[module]?.books[bookNumber]}
            <h1 class="text-xl">
              {modules_obj[module].books[bookNumber][3]}
            </h1>
            <h2 class="text-lg">
              {modules_obj[module].info.chapter_string}
              {chapterNumber}
              {#if startVerseNumber}
                : {startVerseNumber}
                {#if startVerseNumber != endVerseNumber}
                  -{endVerseNumber}
                {/if}
                <button
                  class="rounded text-sm"
                  on:click={() => {
                    startVerseNumber = 0;
                    endVerseNumber = 0;
                  }}
                >
                  <ChevronRight />
                </button>
              {/if}
            </h2>
          {/if}
        </div>
      {/each}
    </div>

    <!-- previous chapter -->
    <button
      disabled={!versesData[pickedModules[0]]?.meta?.previous_chapter}
      on:click={() => goToPreviousChapter()}
      class="{buttonClass} rounded-l"
    >
      <ChevronLeft />
    </button>

    <!-- next chapter -->
    <button
      disabled={!versesData[pickedModules[0]]?.meta?.next_chapter}
      on:click={() => goToNextChapter()}
      class="{buttonClass} rounded-r"
    >
      <ChevronRight />
    </button>

    <section class="my-3">
      <p id="content-top">
        {#if !!versesData[pickedModules[0]]}
          {#each Object.entries(versesData[pickedModules[0]]?.chapter) as [verseNumber, verse] (verseNumber)}
            {#if !startVerseNumber || (startVerseNumber <= verse.verse && endVerseNumber >= verse.verse)}
              {#if !pickedModules[1]}
                {#if verse.verse !== 1}{' '}{/if}<sup>{verse.verse}</sup
                >{#if pickedModules[0].includes('+')}<VerseText data={verse.text} />
                {:else}
                  <span>{verse.text}</span> {' '}
                {/if}
              {:else}
                <div class="flex">
                  <div class="flex py-2">{verse.verse}</div>

                  {#each pickedModules.filter((module) => !!module) as module, moduleNumber (moduleNumber)}
                    <div class="flex-1 p-2">
                      {#if !!versesData[module] && !!versesData[module]?.chapter[verse.verse] && !!modules_obj[module].books[bookNumber]}
                        {#if module.includes('+')}
                          <VerseText data={versesData[module]?.chapter[verse.verse]?.text} />
                        {:else}
                          <span>{versesData[module]?.chapter[verse.verse]?.text}</span>
                          {' '}
                        {/if}
                      {:else}
                        The current Bible Module ({module}) does not contain verses for the selected
                        book. Please select another book using book selection button.
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            {/if}
          {/each}
        {/if}
      </p>
    </section>
  </article>

  <!-- previous chapter -->
  <a href="#content-top">
    <button
      disabled={!versesData[pickedModules[0]]?.meta?.previous_chapter}
      on:click={() => goToPreviousChapter()}
      class="{buttonClass} rounded-l"
    >
      <ChevronLeft />
    </button>
  </a>

  <!-- next chapter -->
  <a href="#content-top">
    <button
      disabled={!versesData[pickedModules[0]]?.meta?.next_chapter}
      on:click={() => goToNextChapter()}
      class="{buttonClass} rounded-r"
    >
      <ChevronRight />
    </button>
  </a>
</div>
