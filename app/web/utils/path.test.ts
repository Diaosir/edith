import { isNodeModules }  from './path';
describe('pathParse', () => {
  test('test path.isNodeModules', () => {
    expect(isNodeModules('antd-modile/lib/ddd.ts')).toBe(true)
    expect(isNodeModules('./lib/ddd.ts')).toBe(false)
  });
});