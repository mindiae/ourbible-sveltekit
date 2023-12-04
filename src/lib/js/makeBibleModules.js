'use strict';
import Database from 'better-sqlite3';
import { readdirSync } from 'node:fs';
import makeBooks from './makeBooksJson.js';
import makeChapters from './makeChaptersJson.js';

readdirSync('static/media/')
  .filter((fileName) => /^.+(?!(?:dictionary|commentary))\.(?:SQL|sql)ite3$/.test(fileName))
  .map((fileName) => {
    return {
      fileName,
      moduleName: fileName
        .replace(/(\.json)?\.(?:SQL|sql)ite3$/, (_, json) => {
          return json ? '+' : '';
        })
        .toUpperCase(),
      bibleDb: new Database('static/media/' + fileName)
    };
  })
  .forEach((module) => {
    makeBooks(module);
    makeChapters(module);
  });
