import { parse }  from './path';
describe('pathParse', () => {
  test('test pathParse', () => {
    const parse1 = parse('/test/node_modules/object-assign@4.1.1')
    const parse2 = parse('/test/node_modules/object-assign/index.js')
    console.log(parse1)
    console.log(parse2)
  });
});