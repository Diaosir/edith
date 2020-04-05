import LocalStorageFs from '../localStorageFs'
import { URI } from 'edith-types/lib/uri'
const { TextEncoder } = require('@exodus/text-encoding-utf8')
const fileSystem = new LocalStorageFs('node_module');
const textDecoder = new TextEncoder();
describe('localStorageFs test', () => {
  async function writeFile(resource: URI, content) {
    await fileSystem.mkdir(URI.parse('node_module:/test'))
    await fileSystem.writeFile(resource, textDecoder.encode(content), { create: true, overwrite: false })
  }
  beforeEach(() => {
    localStorage.clear();
  });
  test('write file', async () => {
    const content = 'var a = 1'
    const resource = URI.parse('node_module:/test/a.js');
    await writeFile(resource, content)
    expect(localStorage.__STORE__[resource.toString()]).toBe(content);
  })
  test('read file', async () => {
    const content = 'var a = 1'
    const resource = URI.parse('node_module:/test/a.ts');
    await writeFile(resource, content);
    const result = await fileSystem.readFile(resource);
    expect(result.toString()).toBe(content);
  })
  test('delete file', async () => {
    const content = 'var a = 1'
    const resource = URI.parse('node_module:/test/a.ts');
    await writeFile(resource, content);
    expect(Object.keys(localStorage.__STORE__).length).toBe(1);
    await fileSystem.delete(resource);
    expect(Object.keys(localStorage.__STORE__).length).toBe(0);
  })
})