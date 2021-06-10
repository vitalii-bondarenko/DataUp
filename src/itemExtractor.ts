import axios from 'axios';
import * as cheerio from 'cheerio';
import { delay } from './utils';
import TagElement = cheerio.TagElement;
import * as fs from 'fs';

const START_ITEM_ID = 1;
// const LAST_ITEM_ID = 779;
const LAST_ITEM_ID = 779;
const DELAY_BETWEEN_REQUEST = 400;

main().then(() => console.log('FINISHED'));

async function getPageHtml(itemId: number) {
  return axios.get(`http://torgy.land.gov.ua/auction/lot-card/${itemId}`);
}

async function extractItemFromHtml(html: any) {
  const item = {};

  const pageObject = cheerio.load(html);

  pageObject('div.top span.title a').each((index, element: TagElement) => {
    item['auctionId'] = element.firstChild.data;
  });

  pageObject('ul.editlist li').each((index, li: TagElement) => {
    const lastChild = li.lastChild;
    const firstChild = li.firstChild;

    let label;
    let value = '';

    if (firstChild.type === 'tag') {
      label = firstChild.firstChild.data;
    }

    if (lastChild.type === 'text') {
      value = lastChild.data;
    } else if (lastChild.type === 'tag') {

      if (lastChild.children[0]?.data) {
        value += lastChild.children[0].data;
      }
      if (lastChild.children[1]?.data) {
        value += lastChild.children[1].data;
      }
      if (lastChild.children[2]?.data) {
        value += lastChild.children[2].data;
      }

    }

    if (label && value) {
      item[label] = value;
    }
  });

  return item;
}

async function main() {
  let currentItemId = START_ITEM_ID;

  while (currentItemId <= LAST_ITEM_ID) {
    let pageHtml;

    try {
      console.log((currentItemId - START_ITEM_ID) / (LAST_ITEM_ID - START_ITEM_ID) * 100, '%');
      pageHtml = (await getPageHtml(currentItemId)).data;
    } catch (e) {
      fs.appendFileSync('../data/errors.txt', `${currentItemId}:${e.response.statusText}\n`);
    }

    await delay(DELAY_BETWEEN_REQUEST);


    if (!pageHtml) {
      currentItemId++;
      continue;
    }


    const item = await extractItemFromHtml(pageHtml);

    fs.writeFileSync(`../data/items/${currentItemId}.json`, JSON.stringify(item));

    currentItemId++;
  }


}
