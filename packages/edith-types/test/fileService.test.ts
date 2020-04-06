import FileService from '../lib/file/fileService'
import { init } from './helper/memfs'
import { URI } from 'edith-types/lib/uri'
// const { TextEncoder } = require('@exodus/text-encoding-utf8')
const fileService = new FileService()

// const textDecoder = new TextEncoder();
describe('localStorageFs test', () => {
  test('1111', async () => {
    const memfs = await init();
    fileService.registerProvider('localFs', memfs);
    const filename = await fileService.resolve(URI.parse(`localFs:@emotion/is-prop-valid`), URI.parse(`localFs:test/src/index.ts`), 'test/node_modules');
    console.log(filename)
  })
})