import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { Database } from 'better-sqlite3';

type Book = {
  book_number: number;
  color: string;
  short_name: string;
  long_name: string;
};

type BooksObj = {
  [bookNumber: number]: Book;
};

type MaxChapter = {
  book_number: number;
  max_chapter: number;
};

type MaxChaptersObj = {
  [bookNumber: number]: MaxChapter;
};

const makeBooks = ({ moduleName, bibleDb }: { moduleName: string; bibleDb: Database }) => {
  const modulePath = 'static/bibles/' + moduleName;
  if (!existsSync(modulePath)) {
    mkdirSync(modulePath);
  }

  const books: Book[] = bibleDb.prepare('SELECT * FROM books').all() as Book[];

  const maxChapters: MaxChapter[] = bibleDb
    .prepare(
      `SELECT book_number, max(chapter) as max_chapter
    FROM verses
    WHERE verse= 1
    GROUP BY book_number`
    )
    .all() as MaxChapter[];

  const dataForWrite: { books: BooksObj; maxChapters: MaxChaptersObj } = {
    books: books.reduce<BooksObj>((accumulator: BooksObj, currentValue: Book): BooksObj => {
      return { ...accumulator, [currentValue.book_number]: currentValue };
    }, {}),
    maxChapters: maxChapters.reduce<MaxChaptersObj>(
      (accumulator: MaxChaptersObj, currentValue: MaxChapter): MaxChaptersObj => {
        return { ...accumulator, [currentValue.book_number]: currentValue };
      },
      {}
    )
  };

  try {
    writeFileSync(`${modulePath}/books.json`, JSON.stringify(dataForWrite));
  } catch (err) {
    console.error(err);
  }
};

export default makeBooks;
