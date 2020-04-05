export  class TemplateCompiler {
  translate(code: string, context?: any, transpilerContext?: any) {
    return import(
      './loader'
    ).then(loader => {
      const transpiledCode = loader.default(code, context, transpilerContext);
      return Promise.resolve({ transpiledCode })
    })
  }
}

export default new TemplateCompiler();