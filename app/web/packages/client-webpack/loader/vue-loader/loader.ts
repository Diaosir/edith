// @flow
/* eslint-disable import/no-webpack-loader-syntax, prefer-template, no-use-before-define, no-shadow, operator-assignment, no-else-return */
import * as querystring from 'querystring';
import { basename, dirname, relative } from 'path';
import {attrsToQuery} from './utils'
import genId from './utils/gen-id';
import parse from './parse';
import genStyleInjectionCode from './utils/styleInjection'
import templateCompiler from './template-compiler';
import styleCompiler from './style-compiler';
import Transpiler from '@/packages/client-webpack/lib/transpiler/transpiler'
import componentNormalizer from 'raw-loader!./runtime/componentNormalizer';
// When extracting parts from the source vue file, we want to apply the
// loaders chained before vue-loader, but exclude some loaders that simply
// produces side effects such as linting.
// function getRawRequest(loaderContext) {
//   return loaderUtils.getRemainingRequest(loaderContext);
// }

const hotReloadAPIPath = '!noop-loader!/node_modules/vue-hot-reload-api.js';
const styleLoaderPath = 'vue-style-loader';
const templateCompilerPath = 'vue-template-compiler';
const styleCompilerPath = 'vue-style-compiler';
const selectorPath = 'vue-selector';

const defaultLang = {
  template: 'html',
  styles: 'css',
  script: 'js',
};

export default async function (code: string, path: string, options: any): Promise<any> {
  let query: any = {}
  options = {
        ...options,
        esModule: false
  };
  const filePath = path;
  const fileName = basename(filePath);
  const sourceRoot = dirname(relative(options.context, filePath))
  const moduleId = genId(path, options.context, options.hashKey);

  const parts = parse(code, fileName, false, sourceRoot);
  const hasScoped = parts.styles.some(({ scoped }) => scoped);
  const templateAttrs =
    parts.template && parts.template.attrs && parts.template.attrs;
  const hasComment = templateAttrs && templateAttrs.comments;
  const functionalTemplate = templateAttrs && templateAttrs.functional;
  const bubleTemplateOptions = { ...options.buble };
  bubleTemplateOptions.transforms = { ...bubleTemplateOptions.transforms };
  bubleTemplateOptions.transforms.stripWithFunctional = functionalTemplate;

  const hasFunctional = parts.template && parts.template.attrs.functional
  let denpencies = [];
  const templateCompilerOptions = {
    type: 'template',
    id: moduleId,
    hasScoped,
    hasComment,
    transformToRequire: {
      video: 'src',
      source: 'src',
      img: 'src',
      image: 'xlink:href',
    },
    preserveWhitespace: false,
    buble: bubleTemplateOptions,
    // only pass compilerModules if it's a path string
    compilerModules:
      typeof options.compilerModules === 'string'
        ? options.compilerModules
        : undefined
  };

  let templateImport: any = `var render, staticRenderFns`
  if (parts.template) {
    const { transpiledCode } = await templateCompiler.translate(parts.template.content, templateCompilerOptions);
    templateImport = transpiledCode;
  }
  console.log(parts)
  let scriptImport = `var script = {}`;
  if (parts.script) {
    const lang = parts.script.attrs['lang'] || 'js';
    const scriptSrc = `${filePath}.${lang}`
    const depName = `./${fileName}.${lang}`;
    await Transpiler.setFileMap(scriptSrc, parts.script.content);
    await Transpiler.setFileMap(`${dirname(filePath)}/componentNormalizer.js`, componentNormalizer)
    denpencies.push(depName);
    // await Transpiler.traverse(parts.script.content, scriptSrc, filePath);
    scriptImport = (
      `import script from '${depName}'\n` +
      `export * from '${depName}'` // support named exports
    )
  }

  // styles
  let stylesCode = ``
  if (parts.styles.length) {
    // const a = await styleCompiler.translate(parent)
    const { style, content , lang, scoped } = parts.styles[0];
    const { transpiledCode } = await styleCompiler.translate(content, filePath, moduleId, scoped);
    const styleHref = `${filePath}.${lang || 'css'}`
    const depName = `./${fileName}.${lang || 'css'}`;
    await Transpiler.setFileMap(styleHref, transpiledCode);
    stylesCode = `import '${depName}'`
    // stylesCode = genStyleInjectionCode(
    //   parts.styles,
    //   moduleId,
    //   filePath,
    //   false,
    //   false
    // )
  }
  let result = `
${templateImport}
${scriptImport}
${stylesCode}
/* normalize component */
import normalizer from "./componentNormalizer.js"
var component = normalizer(
  script,
  render,
  staticRenderFns,
  ${hasFunctional ? `true` : `false`},
  ${/injectStyles/.test(stylesCode) ? `injectStyles` : `null`},
  ${hasScoped ? JSON.stringify(moduleId) : `null`},
  null,
  ''
)
  `.trim() + `\n`
  // const loaders = { ...defaultLoaders };
  // const preLoaders = {};
  // const postLoaders = {};

  // let cssModules;

  result += `\ncomponent.options.__file = '${filePath}'`;
  result += `\nexport default component.exports`
  return {
    transpiledCode: result,
    denpencies
  };
}