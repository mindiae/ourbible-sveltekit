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

let infoData = readdirSync('static/media/')
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
        bibleDb.prepare(`select book_number FROM books`).all() as { book_number: number }[]
      ).map<number>((book: { book_number: number }): number => {
        return book.book_number;
      })
    };
  })
  .reduce((accumulator, module) => {
    makeBooks(module);
    makeChapters(module);

    return { ...accumulator, [module.moduleName]: { info: module.info, books: module.books } };
  }, {});

writeFileSync('static/bibles/modules.json', JSON.stringify(infoData));
