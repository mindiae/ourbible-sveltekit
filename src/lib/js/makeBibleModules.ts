'use strict';
import Database from 'better-sqlite3';
import { readdirSync, writeFileSync } from 'node:fs';
import makeBooks from './makeBooksJson.js';
import makeChapters from './makeChaptersJson.js';

type Info = {
  name: string;
  value: string;
};

type InfoObj = {
  [name: string]: string;
};

type Book = {
  book_number: number;
  max_chapter: number;
};

type BooksObj = {
  [bookNumber: number]: number;
};

const infoData = readdirSync('static/media/')
  .filter((fileName) => /^.+(?!(?:dictionary|commentary))\.(?:SQL|sql)ite3$/.test(fileName))
  .map((fileName) => {
    const bibleDb = new Database('static/media/' + fileName);
    return {
      fileName,
      moduleName: fileName
        .replace(/(\.json)?\.(?:SQL|sql)ite3$/, (_, json) => {
          return json ? '+' : '';
        })
        .toUpperCase(),
      bibleDb,
      info: (
        bibleDb.prepare(`SELECT * FROM info`).all() as { book_number: number }[]
      ).reduce<InfoObj>((infoObj: InfoObj, currentValue: unknown): InfoObj => {
        const { name, value } = currentValue as Info;
        return { ...infoObj, [name]: value };
      }, {}),
      books: (
        bibleDb
          .prepare(
            `SELECT book_number, max(chapter) as max_chapter
          FROM verses
          WHERE verse= 1
          GROUP BY book_number`
          )
          .all() as Book[]
      ).reduce<BooksObj>((accumulator: BooksObj, book: Book): BooksObj => {
        return { ...accumulator, [book.book_number]: book.max_chapter };
      }, {})
    };
  })
  .reduce((accumulator, module) => {
    makeBooks(module);
    makeChapters(module);

    return { ...accumulator, [module.moduleName]: { info: module.info, books: module.books } };
  }, {});

writeFileSync('static/bibles/modules.json', JSON.stringify(infoData));
