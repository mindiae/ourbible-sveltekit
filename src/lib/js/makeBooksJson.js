'use strict';
import Database from 'better-sqlite3';
import fs from 'fs';

const moduleName = process.argv[2];

const db = new Database(`./database/${moduleName}.SQLite3`);

const modulePath = `./static/${moduleName}`;
if (!fs.existsSync(modulePath)) {
  fs.mkdirSync(modulePath);
}

const books = db
  .prepare('SELECT * FROM books')
  .all();

const maxChapters = db
  .prepare(
    `SELECT book_number, max(chapter) as max_chapter
    FROM verses
    WHERE verse= 1
    GROUP BY book_number`)
  .all();

let dataForWrite = {};

dataForWrite.books = books.reduce(
  (accumulator, currentValue) => {
    return { ...accumulator, [currentValue.book_number]: currentValue };
  },
  {}
);

dataForWrite.maxChapters = maxChapters.reduce(
  (accumulator, currentValue) => {
    return { ...accumulator, [currentValue.book_number]: currentValue }
  },
  {}
);


try {
  fs.writeFileSync(`${modulePath}/books.json`, JSON.stringify(dataForWrite));
} catch (err) {
  console.error(err);
}

