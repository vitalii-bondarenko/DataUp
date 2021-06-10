const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
import {delay} from './utils';

const LAST_PAGE = 2565;
// const LAST_PAGE = 5;

main().then(() => console.log('FINISHED'));

async function getPageHtml(pageNumber) {
  console.log(pageNumber);
  return axios.get(`http://torgy.land.gov.ua/auction/lots/?page=${pageNumber}`);
}

async function extractItemsArrayFromHtml(html) {
  const items = [];

  const pageObject = cheerio.load(html);

  pageObject('tbody tr.data-row').each((index, tr) => {
      const item = {};

      tr.children.forEach((td, index) => {

        const value = td.childNodes[0].data;

        if (index === 0) {
          item['id'] = value;
        } else if (index === 1) {
          item['cadastralNumber'] = value;
        } else if (index === 2) {
          item['area'] = value;
        } else if (index === 3) {
          item['location'] = value;
        } else if (index === 4) {
          item['purpose'] = value;
        } else if (index === 5) {
          item['datetime'] = value;
        }
      });

      items.push(item);
    },
  );

  return items;
}

async function main() {
  const writeStream = fs.createWriteStream('data/items.csv');
  writeStream.write('Номер лоту; Кадастровий номер;Площа;Місцезнаходження;Цільове направлення; Час проведення аукціону\n');

  for (let i = 1; i <= LAST_PAGE; i++) {
    const pageHtml = (await getPageHtml(i)).data;

    await delay(500);

    const items = await extractItemsArrayFromHtml(pageHtml);
    for (const item of items) {
      const csvString = `${item.id};${item.cadastralNumber};${item.area};${item.location};${item.purpose};${item.datetime}\n`;
      writeStream.write(csvString);
    }
  }

  writeStream.end();

  writeStream.on('finish', () => {
    console.log('finish write stream, moving along');
  }).on('error', (err) => {
    console.log(err);
  });
}


