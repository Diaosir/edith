
// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = [
  'id',
  'index',
  'src',
  'type'
]

// transform the attrs on a SFC block descriptor into a resourceQuery string
export function attrsToQuery(attrs, langFallback){
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${name}=${value ? value : ``}`
    }
  }
  if (langFallback && !(`lang` in attrs)) {
    query += `&lang=${langFallback}`
  }
  return query
}
