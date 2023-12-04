import { existsSync, mkdirSync, writeFileSync } from 'fs';

const makeBooks = ({ moduleName, bibleDb }) => {
  const modulePath = 'static/json-api/' + moduleName;
  if (!existsSync(modulePath)) {
    mkdirSync(modulePath);
  }

  const books = bibleDb.prepare('SELECT * FROM books').all();

  const maxChapters = bibleDb
    .prepare(
      `SELECT book_number, max(chapter) as max_chapter
    FROM verses
    WHERE verse= 1
    GROUP BY book_number`
    )
    .all();

  let dataForWrite = {};

  dataForWrite.books = books.reduce((accumulator, currentValue) => {
    return { ...accumulator, [currentValue.book_number]: currentValue };
  }, {});

  dataForWrite.maxChapters = maxChapters.reduce((accumulator, currentValue) => {
    return { ...accumulator, [currentValue.book_number]: currentValue };
  }, {});

  try {
    writeFileSync(`${modulePath}/books.json`, JSON.stringify(dataForWrite));
  } catch (err) {
    console.error(err);
  }
};

export default makeBooks;
