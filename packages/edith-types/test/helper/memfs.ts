import Memfs from '../../lib/file/memfs'
import { URI } from 'edith-types/lib/uri';
export async function init() {
  const memfs = new Memfs();
  const data = require('./data.json')
  const { contents  } = JSON.parse(data.value)
  // await memfs.writeFileAnyway(URI.parse(`${schema}/`))
  await Promise.all(Object.keys(contents).map( async contentName => {
    await memfs.writeFileAnyway(URI.parse(`localFs:test/${contentName}`), contents[contentName].content, { create: true, overwrite: true });
  }))
  return memfs;
}