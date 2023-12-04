import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import type { Database } from 'better-sqlite3';

type Book = {
  book_number: number;
  color: string;
  short_name: string;
  long_name: string;
};

type Chapter = {
  verse: number;
  text: string;
};

type ChaptersObj = {
  [verseNumber: number]: Chapter;
};

type ChapterData = {
  chapter: ChaptersObj;
  meta: {
    connection: string;
    book_number: number;
    chapter_number: number;
    previous_chapter: {
      connection: string;
      book_number: number;
      chapter: number;
    } | null;
    next_chapter: {
      connection: string;
      book_number: number;
      chapter: number;
    } | null;
  };
};

const makeChapters = ({ moduleName, bibleDb }: { moduleName: string; bibleDb: Database }) => {
  const modulePath = `static/bibles/${moduleName}`;
  if (!existsSync(modulePath)) {
    mkdirSync(modulePath);
  }

  const books: Book[] = bibleDb.prepare('SELECT * FROM books').all() as Book[];

  const selectChapter = bibleDb.prepare(`
  SELECT verse, text
  FROM verses
  WHERE book_number = ? AND chapter = ?`);

  const selectMaxBookNumber = bibleDb.prepare(`
  SELECT max(book_number) as max_book_number
  FROM books
`);

  const selectMaxChapter = bibleDb.prepare(`
  SELECT max(chapter) as max_chapter
  FROM verses
  WHERE verse = 1 AND book_number = ?
`);

  let previousBookNumber: number;
  let previousChapterNumber: number;

  const { max_book_number }: { max_book_number: number } = selectMaxBookNumber.get() as {
    max_book_number: number;
  };

  books.forEach(({ book_number }: Book) => {
    const bookNumberPath = `${modulePath}/${book_number}`;
    if (!existsSync(bookNumberPath)) {
      mkdirSync(bookNumberPath);
    }

    const { max_chapter }: { max_chapter: number } = selectMaxChapter.get([book_number]) as {
      max_chapter: number;
    };

    Array.from({ length: max_chapter }, (_, i) => i + 1).forEach((chapter_number) => {
      const chapterNumberPath = `${bookNumberPath}/${chapter_number}.json`;

      const chapter: ChaptersObj = (
        selectChapter.all([book_number, chapter_number]) as Chapter[]
      ).reduce<ChaptersObj>((accumulator: ChaptersObj, currentValue: Chapter): ChaptersObj => {
        const text = moduleName.includes('+') ? JSON.parse(currentValue.text) : currentValue.text;

        return { ...accumulator, [currentValue.verse]: { verse: currentValue.verse, text } };
      }, {});

      const previous_chapter = previousChapterNumber
        ? {
            connection: moduleName,
            book_number: previousBookNumber,
            chapter: previousChapterNumber
          }
        : null;

      const nextChapterIsAvailable =
        book_number != max_book_number && chapter_number != max_chapter;

      const next_book_number = chapter_number == max_chapter ? book_number + 1 : book_number;

      const next_chapter_number = chapter_number == max_chapter ? 1 : chapter_number + 1;

      const next_chapter = nextChapterIsAvailable
        ? {
            connection: moduleName,
            book_number: next_book_number,
            chapter: next_chapter_number
          }
        : null;

      const dataForWrite: ChapterData = {
        chapter,
        meta: {
          connection: moduleName,
          book_number,
          chapter_number,
          previous_chapter,
          next_chapter
        }
      };

      writeFileSync(chapterNumberPath, JSON.stringify(dataForWrite));

      previousBookNumber = book_number;
      previousChapterNumber = chapter_number;
    });
  });
};

export default makeChapters;
