<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import ChevronDown from './ChevronDown.svelte';
  import ChevronLeft from './ChevronLeft.svelte';
  import ChevronRight from './ChevronRight.svelte';
  import VerseText from './VerseText.svelte';

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
    [bookNumber: string]: number;
  };

  type BibleModule = {
    info: BibleModuleInfo;
    books: BibleModuleBooks;
  };

  type BibleModules = {
    [moduleName: string]: BibleModule;
  };

  interface Verse {
    verse: number;
    text: string;
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

  interface Book {
    book_color: string;
    book_number: number;
    short_name: string;
    long_name: string;
  }

  interface Books {
    [key: string]: Book;
  }

  interface MaxChapter {
    book_number: number;
    max_chapter: number;
  }

  interface MaxChapters {
    [key: string]: MaxChapter;
  }

  interface BooksData {
    books: Books;
    maxChapters: MaxChapters;
  }
  const urlParams = $page.url.searchParams;

  let default_module = 'NTPT+';
  let modules_obj: BibleModules;
  let uiModule: string;
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
        { length: modules_obj[uiModule].books[parseInt(tmpBookNumber)] },
        (_, i) => i + 1
      ).includes(parseInt(tmpChapterNumber))
        ? parseInt(tmpChapterNumber)
        : 1;

    const tmpStartVerseNumber = urlParams.get('i') || '';
    startVerseNumber = parseInt(tmpStartVerseNumber);
    const tmpEndveVerseNumber = urlParams.get('e') || '';
    endVerseNumber = parseInt(tmpEndveVerseNumber);

    pickedModules.forEach((module, i) => {
      if (!!module) {
        setBooks(i).then((data) => {
          pickedBooks[i] = data;
          pickedBooks = pickedBooks;
        });
        setVerses(i).then((data) => {
          pickedVerses[i] = data;
          pickedVerses = pickedVerses;
        });
      }
    });
  });

  let showingBooksDropdown = false;
  let showingChaptersDropdown = false;

  let pickedVerses: (Data | undefined)[] = [];

  const buttonClass =
    'inline-flex bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 shadow align-middle leading-[1em] disabled:opacity-50';

  const setVerses = async (i: number) => {
    if (!!modules_obj[pickedModules[i]]?.books[bookNumber] && browser) {
      const response = await fetch(
        `/bibles/${pickedModules[i]}/${bookNumber}/${chapterNumber}.json`
      );
      const data = await response.json();
      return data;
    }
    return undefined;
  };

  const setAllVerses = async () => {
    const promises = Array.from({ length: pickedModules.length - 1 }, (_, i) => i).map((i) =>
      setVerses(i).then((data) => (pickedVerses[i] = data))
    );
    await Promise.all(promises);
  };

  const setBooks = async (i: number) => {
    if (browser && !!pickedModules[i]) {
      const response = await fetch(`/bibles/${pickedModules[i]}/books.json`);
      const data = await response.json();
      return data;
    }
    return undefined;
  };

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

  let books: BooksData | undefined;
  $: books = pickedBooks[pickedModules?.indexOf(uiModule)];

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

  let pickedBooks: (BooksData | undefined)[] = [];

  $: if (!!pickedModules[1]) {
    pickedModules.forEach((module, i) => {
      if (!!module) {
        setBooks(i).then((data) => {
          pickedBooks[i] = data;
          pickedBooks = pickedBooks;
        });
        setVerses(i).then((data) => {
          pickedVerses[i] = data;
          pickedVerses = pickedVerses;
        });
      }
    });
    //setUrlParams();
  }

  const goToPreviousChapter = () => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    const previousChapterBook = pickedVerses[0]?.meta?.previous_chapter?.book_number;
    const previousChapter = pickedVerses[0]?.meta?.previous_chapter?.chapter;
    chapterNumber = 1;
    bookNumber = previousChapterBook ?? bookNumber;
    chapterNumber = previousChapter ?? chapterNumber;
    setAllVerses();
    //setUrlParams();
    return undefined;
  };

  const goToNextChapter = () => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    const nextChapterBook = pickedVerses[0]?.meta?.next_chapter?.book_number;
    const nextChapter = pickedVerses[0]?.meta?.next_chapter?.chapter;
    chapterNumber = 1;
    bookNumber = nextChapterBook ?? bookNumber;
    chapterNumber = nextChapter ?? chapterNumber;
    setAllVerses();
    //setUrlParams();
    return undefined;
  };

  const goToBook = (book_number: number) => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    chapterNumber = 1;
    bookNumber = book_number;
    setAllVerses();
    //setUrlParams();
    return undefined;
  };

  const goToChapter = (chapter_number: number) => {
    startVerseNumber = 0;
    endVerseNumber = 0;
    chapterNumber = chapter_number;
    setAllVerses();
    //setUrlParams();
    return undefined;
  };
</script>

<div>
  <div>
    <!-- show books toggle -->
    <button
      on:click={() => {
        showingBooksDropdown = !showingBooksDropdown;
        showingChaptersDropdown = false;
      }}
      class="{buttonClass} rounded-l"
    >
      {#if books && books.books[bookNumber]}
        {books.books[bookNumber].short_name}
      {:else}
        {'=='}
      {/if}

      <ChevronDown class="ml-2" />
    </button>

    <!-- show chapters toggle -->
    <button
      on:click={() => {
        showingChaptersDropdown = !showingChaptersDropdown;
        showingBooksDropdown = false;
      }}
      class="{buttonClass} rounded-r"
    >
      {chapterNumber}
      <ChevronDown class="ml-2" />
    </button>
    {' '}

    <!-- previous chapter -->
    <button
      disabled={!pickedVerses[0]?.meta?.previous_chapter}
      on:click={() => goToPreviousChapter()}
      class="{buttonClass} rounded-l"
    >
      <ChevronLeft />
    </button>

    <!-- next chapter -->
    <button
      disabled={!pickedVerses[0]?.meta?.next_chapter}
      on:click={() => goToNextChapter()}
      class="{buttonClass} rounded-r"
    >
      <ChevronRight />
    </button>
    <!---->
    <!-- <!-- books -->
    <div class={showingBooksDropdown ? 'block' : 'hidden'}>
      {#if !!books}
        {#each Object.entries(books.books) as [book_number, book] (book_number)}
          {#if book.book_number == 470}
            <br class="first:hidden" />
          {/if}
          <button
            on:click={() => goToBook(book.book_number)}
            class="border rounded px-2 disabled:font-bold"
            style="background-color: {book.book_color};"
            disabled={book.book_number == bookNumber}
          >
            {book.short_name}
          </button>
        {/each}
      {/if}
    </div>

    <!-- chapters per book -->
    {#if !!books?.maxChapters[bookNumber]}
      <div class={showingChaptersDropdown ? 'block' : 'hidden'}>
        {#each Array.from({ length: books.maxChapters[bookNumber].max_chapter }, (_, i) => i + 1) as chapter_number (chapter_number)}
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

    <!-- menu language -->
    <div class="mt-2">
      {#each pickedModules as pickedModule, key (key)}
        {#if !!pickedModule}
          <button class="border rounded px-2">
            <label>
              {pickedModule}
              <input type="radio" value={pickedModule} bind:group={uiModule} />
            </label>
          </button>
        {/if}
      {/each}
    </div>

    <div class="mb-2">
      {#if modules_obj}
        {#each Object.entries(modules_obj) as [module, val] (module)}
          <button class="rounded border px-2">
            <label>
              {module}
              <input
                type="checkbox"
                bind:group={pickedModules}
                value={module}
                disabled={pickedModules.length > 2 && !pickedModules.includes(module)}
              />
            </label>
          </button>
        {/each}
      {/if}
    </div>

    <article>
      {#if books && books.books[bookNumber]}
        <h1>
          {books.books[bookNumber].long_name}
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
        </h1>
      {/if}

      <p id="content-top">
        {#if !!pickedVerses[0]}
          {#each Object.entries(pickedVerses[0]?.chapter) as [verseNumber, verse] (verseNumber)}
            {#if !startVerseNumber || (startVerseNumber <= verse.verse && endVerseNumber >= verse.verse)}
              {#if !pickedModules[1]}
                <sup>{verse.verse}</sup>

                {#if pickedModules[0].includes('+')}
                  <VerseText data={verse.text} />
                {:else}
                  <span>{verse.text}</span> {' '}
                {/if}
              {:else}
                <div class="flex">
                  <div class="flex py-2">{verse.verse}</div>

                  {#each pickedModules.filter((module) => !!module) as _, moduleNumber (moduleNumber)}
                    <div class="flex-1 p-2">
                      {#if !!pickedVerses[moduleNumber]?.chapter[verse.verse]}
                        {#if pickedModules[moduleNumber].includes('+')}
                          <VerseText
                            data={pickedVerses[moduleNumber]?.chapter[verse.verse]?.text}
                          />
                        {:else}
                          <span>{pickedVerses[moduleNumber]?.chapter[verse.verse]?.text}</span>
                          {' '}
                        {/if}
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            {/if}
          {/each}
        {/if}
      </p>
    </article>

    <!-- previous chapter -->
    <a href="#content-top">
      <button
        disabled={!pickedVerses[0]?.meta?.previous_chapter}
        on:click={() => goToPreviousChapter}
        class="{buttonClass} rounded-l"
      >
        <ChevronLeft />
      </button>
    </a>

    <!-- next chapter -->
    <a href="#content-top">
      <button
        disabled={!pickedVerses[0]?.meta?.next_chapter}
        on:click={() => goToNextChapter}
        class="{buttonClass} rounded-r"
      >
        <ChevronRight />
      </button>
    </a>
  </div>
</div>
