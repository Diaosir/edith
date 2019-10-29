/* eslint-disable no-use-before-define */
import transpile from 'vue-template-es2015-compiler';
import * as compiler from 'vue-template-compiler';

export default function(html: string, options: any) {
  const vueOptions = options.vueOptions || {};
  const needsHotReload = false;

  // const defaultModules = [
  //   transformRequire(options.transformRequire),
  //   transformSrcset(),
  // ];
  // const userModules = vueOptions.compilerModules || options.compilerModules;

  const compilerOptions = {
    preserveWhitespace: options.preserveWhitespace,
    modules: [],
    directives:
      vueOptions.compilerDirectives || options.compilerDirectives || {},
    scopeId: options.hasScoped ? options.id : null,
    comments: options.hasComment,
  };

  const compiled = compiler.compile(html, compilerOptions);

  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach(tip => {
      console.warn({
        name: 'vue-warning',
        message: tip,
        fileName: options.filename,
        lineNumber: 1,
        columnNumber: 1,
        source: 'vue-template-compiler',
      });
    });
  }

  let code;
  if (compiled.errors && compiled.errors.length) {
    console.error(
      new Error(
        `\n  Error compiling template:\n${pad(html)}\n` +
          compiled.errors.map(e => `  - ${e}`).join('\n') +
          '\n'
      )
    );
    code = 'module.exports={render:function(){},staticRenderFns:[]}';
  } else {
    const bubleOptions = options.buble;
    const stripWith = bubleOptions.transforms.stripWith !== false;
    const { stripWithFunctional } = bubleOptions.transforms;

    const staticRenderFns = compiled.staticRenderFns.map(fn =>
      toFunction(fn, stripWithFunctional)
    );

    code =
      transpile(
        'var render = ' +
          toFunction(compiled.render, stripWithFunctional) +
          '\n' +
          'var staticRenderFns = [' +
          staticRenderFns.join(',') +
          ']',
        bubleOptions
      ) + '\n';
    // mark with stripped (this enables Vue to use correct runtime proxy detection)
    if (stripWith) {
      code += `render._withStripped = true\n`;
    }

    // const exports = `{ render: render, staticRenderFns: staticRenderFns }`;
    // code += `module.exports = ${exports}`;
  }

  // hot-reload
  if (needsHotReload) {
    // const exportsName = vueOptions.esModule ? 'esExports' : 'module.exports';
    // code +=
    //   '\nif (module.hot) {\n' +
    //   '  module.hot.accept()\n' +
    //   '  if (module.hot.data) {\n' +
    //   '    require("' +
    //   hotReloadAPIPath +
    //   '")' +
    //   '      .rerender("' +
    //   options.id +
    //   '", ' +
    //   exportsName +
    //   ')\n' +
    //   '  }\n' +
    //   '}';
  }
  console.log(code)
  return code;
}

function toFunction(code, stripWithFunctional) {
  return (
    'function (' + (stripWithFunctional ? '_h,_vm' : '') + ') {' + code + '}'
  );
}

function pad(html) {
  return html
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n');
}
