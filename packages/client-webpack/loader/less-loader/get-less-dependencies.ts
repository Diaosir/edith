const Walker = require('node-source-walk');
import { parse } from 'path'
import * as postcssLess from 'postcss-less';
/**
 *
 * base detective-less
 * @param {*} node
 * @returns
 */
function isImportStatement(node) {
  return !!node && node.type === 'atrule' && node.name === 'import' && node.import;
}

function extractDependencies(importStatementNode) {
  let { filename } = importStatementNode;
  filename = filename.replace(/["']/g, '');
  if (parse(filename).ext === '') {
    return `${filename}.less`;
  }
  return filename
}


export default function getLessdependencies(content) {
  let ast = {};
  try {
    ast = postcssLess.parse(content, {});
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