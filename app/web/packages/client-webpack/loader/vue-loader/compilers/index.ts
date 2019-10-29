export default async function(
  content: string, 
  filename: string,
  lang: string,
  options,
  loaderContext: any
  ) {
    import(
      `./${lang}`
    ).then(compiler => {
      return compiler(content, filename, options, loaderContext);
    }).catch(error => {
      loaderContext.log.error(`can‘t find loader to handle ${lang}`)
    })
}