import { parse, isNodeModules }  from './path';
describe('pathParse', () => {
  test('test pathParse', () => {
    const parse1 = parse('/test/node_modules/object-assign@4.1.1')
    const parse2 = parse('/test/node_modules/object-assign/index.js')
  });
  test('test path.isNodeModules', () => {
    expect(isNodeModules('antd-modile/lib/ddd.ts')).toBe(true)
    expect(isNodeModules('./lib/ddd.ts')).toBe(false)
  });
});