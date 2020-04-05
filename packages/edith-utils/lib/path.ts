const SPLIT_PATH_RE = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[js|ts|jsx|css|jpg|png|tsx|json|html|less|scss][^.\/]*|))(?:[\/]*)$/;
import path from 'path';
export function parse(pathString: string) {
  if (typeof pathString !== 'string') {
    throw new TypeError(
        "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  const allParts = SPLIT_PATH_RE.exec(pathString).slice(1);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
}

export function normalize(pathString: string = '') {
  // if (pathString[0] === '/') {
  //   pathString = pathString.split('').splice(1).join('');
  // }
  return path.normalize(pathString || '')
}

export function isNodeModules(filename: string) {
  if(typeof filename !== 'string' || filename === '') {
    return false;
  }
  return !filename.match(/^.{1,2}\//)
}

export function resolve(base: string, filename: string) {
  let result = ''
  if(base.match(/\.\w+$/)) {
    result = path.resolve(path.dirname(base), filename);
  } else {
    result = path.resolve(base, filename);
  }
  if (result[0] === '/') {
    result = result.split('').splice(1).join('');
  }
  return result;
}
export function originalResolve(base: string, filename: string) {
  return path.resolve(base, filename);
}
export function isDir(path: string): boolean {
  const { ext } = parse(path);
  console.log(ext)
  return false;
}
export function getAllEnablePaths(moduleSuffix: Array<string> = ['js', 'jsx', 'ts', 'tsx', 'vue'], filename: string) {
  let result = [filename];
  const { ext } = parse(filename);
  if (!ext) {
    moduleSuffix.forEach(suffix => {
      result.push(`${filename}.${suffix}`)
      result.push(`${filename}/index.${suffix}`)
    })
  }
  return result;
}