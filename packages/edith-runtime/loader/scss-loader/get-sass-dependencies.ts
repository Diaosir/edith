const Walker = require('node-source-walk');
import { parse } from 'path'
import * as postcssScss from 'postcss-scss';
/**
 *
 * base detective-less
 * @param {*} node
 * @returns
 */
function isImportStatement(node) {
  return !!node && node.type === 'atrule' && node.name === 'import'
}

function extractDependencies(importStatementNode) {
  let { params: filename } = importStatementNode;
  filename = filename.replace(/["']/g, '');
  if (parse(filename).ext === '') {
    return `${filename}.scss`;
  }
  return filename
}


export default function getLessdependencies(content) {
  let ast = {};
  try {
    ast = postcssScss.parse(content, {});
  } catch(error) {
    //TODO log
  }
  let dependencies = [];
  const walker = new Walker();
  walker.walk(ast, function(node) {
    if (!isImportStatement(node)) { return; }
    dependencies = dependencies.concat(extractDependencies(node));
  });
  return dependencies;
}