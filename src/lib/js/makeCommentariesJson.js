'use strict';
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import Database from 'better-sqlite3';

const storeData = (data = '', path = '') => {
  try {
    writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const commentaries = readdirSync('static/media/').filter(file => /.*\.commentaries\.(sql|SQL)ite3$/.test(file));

