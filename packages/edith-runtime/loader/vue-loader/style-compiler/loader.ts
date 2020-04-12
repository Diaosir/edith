const postcss = require('postcss')
import { ProcessOptions, LazyResult } from 'postcss'
import trimPlugin from './stylePlugins/trim'
import scopedPlugin from './stylePlugins/scoped'


export interface StyleCompileOptions {
  source: string
  filename: string
  id: string
  map?: any
  scoped?: boolean
  trim?: boolean
  preprocessLang?: string
  preprocessOptions?: any
  postcssOptions?: any
  postcssPlugins?: any[]
}

export interface AsyncStyleCompileOptions extends StyleCompileOptions {
  isAsync?: boolean
}

export interface StyleCompileResults {
  code: string
  map: any | void
  rawResult: LazyResult | void
  errors: string[]
}

export default function compileStyle(
  options: StyleCompileOptions
): StyleCompileResults {
  return doCompileStyle({ ...options, isAsync: false })
}

export function compileStyleAsync(
  options: StyleCompileOptions
): Promise<StyleCompileResults> {
  return Promise.resolve(doCompileStyle({ ...options, isAsync: true }))
}

export function doCompileStyle(
  options: AsyncStyleCompileOptions
): StyleCompileResults {
  const {
    filename,
    id,
    scoped = true,
    trim = true
  } = options
  const source = options.source;

  const plugins = ([]).slice()
  if (trim) {
    plugins.push(trimPlugin())
  }
  if (scoped) {
    plugins.push(scopedPlugin(id))
  }

  const postCSSOptions: ProcessOptions = {
    to: filename,
    from: filename
  }

  let result, code, outMap
  const errors: any[] = []
  try {
    console.log(plugins)
    result = postcss(plugins).process(source, postCSSOptions)
    // In async mode, return a promise.
    if (options.isAsync) {
      return result
        .then(
          (result: LazyResult): StyleCompileResults => ({
            code: result.css || '',
            map: result.map && result.map.toJSON(),
            errors,
            rawResult: result
          })
        )
        .catch(
          (error: Error): StyleCompileResults => ({
            code: '',
            map: undefined,
            errors: [...errors, error.message],
            rawResult: undefined
          })
        )
    }

    // force synchronous transform (we know we only have sync plugins)
    code = result.css
    outMap = result.map
  } catch (e) {
    errors.push(e)
  }

  return {
    code: code || ``,
    map: outMap && outMap.toJSON(),
    errors,
    rawResult: result
  }
}
