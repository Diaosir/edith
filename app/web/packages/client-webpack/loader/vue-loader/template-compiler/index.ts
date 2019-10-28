export  class TemplateCompiler {
  translate(code: string, context?: any) {
    return import(
      './loader'
    ).then(loader => {
      const transpiledCode = loader.default(code, context);
      return Promise.resolve({ transpiledCode })
    })
  }
}

export default new TemplateCompiler();