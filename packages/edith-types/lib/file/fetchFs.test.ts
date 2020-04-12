import FetchFs from './fetchFs'
import { URI } from '../uri'
describe('fetchFs', () => {
  const fetchFs = new FetchFs('unpkg', 'https://unpkg.com')
  test('read file', async () => {
   await fetchFs.readFile(URI.parse('unpkg:/react@16.13.1'));
  //  await fetchFs.readFile(URI.parse('unpkg:/react@16.13.1/cjs/react.production.min.js'));
  //  await fetchFs.readFile(URI.parse('unpkg:/react@16.13.1/cjs/react.development.js'));
    // const res2 = await fetchFs.readFile(URI.parse('unpkg:/dom-helpers@5.1.4/addClass'));
  });
});