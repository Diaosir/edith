export  class StyleCompiler {
  translate(code: string, filename: string, moduleId: string, scoped: any) {
    return import(
      './loader'
    ).then(loader => {
      const { code: transpiledCode , map, errors } = loader.default({
        source: code,
        filename: filename,
        id: `data-v-${moduleId}`,
        map: false,
        scoped: !!scoped,
        trim: true
      });
      return Promise.resolve({ transpiledCode })
    })
  }
}

export default new StyleCompiler();