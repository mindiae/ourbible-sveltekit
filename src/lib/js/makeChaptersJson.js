import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const makeChapters = ({ moduleName, bibleDb }) => {
  const modulePath = `static/json-api/${moduleName}`;
  if (!existsSync(modulePath)) {
    mkdirSync(modulePath);
  }

  const books = bibleDb.prepare('SELECT * FROM books').all();

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

  let previousBookNumber;
  let previousChapterNumber;

  const { max_book_number } = selectMaxBookNumber.get();

  books.forEach(({ book_number }) => {
    const bookNumberPath = `${modulePath}/${book_number}`;
    if (!existsSync(bookNumberPath)) {
      mkdirSync(bookNumberPath);
    }

    const { max_chapter } = selectMaxChapter.get([book_number]);

    Array.from({ length: max_chapter }, (_, i) => i + 1).forEach((chapter_number) => {
      const chapterNumberPath = `${bookNumberPath}/${chapter_number}.json`;

      let dataForWrite = {};

      const chapter = selectChapter.all([book_number, chapter_number]);

      dataForWrite.chapter = chapter.reduce((accumulator, { verse, text: oldText }) => {
        const text = moduleName.includes('+') ? JSON.parse(oldText) : oldText;

        return { ...accumulator, [verse]: { verse, text } };
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

      dataForWrite.meta = {
        connection: moduleName,
        book_number,
        chapter_number,
        previous_chapter,
        next_chapter
      };

      writeFileSync(chapterNumberPath, JSON.stringify(dataForWrite));

      previousBookNumber = book_number;
      previousChapterNumber = chapter_number;
    });
  });
};

export default makeChapters;
