const Walker = require('node-source-walk');
const gonzales = require('gonzales-pe');
/**
 *
 * base detective-less
 * @param {*} node
 * @returns
 */
function isImportStatement(node) {
  if (!node || node.type !== 'atrule') { return false; }
  if (!node.content.length || node.content[0].type !== 'atkeyword') { return false; }

  const atKeyword = node.content[0];

  if (!atKeyword.content.length) { return false; }

  const importKeyword = atKeyword.content[0];

  if (importKeyword.type !== 'ident' || importKeyword.content !== 'import') { return false; }

  return true;
}

function extractDependencies(importStatementNode) {
  return importStatementNode.content
  .filter(function(innerNode) {
    return innerNode.type === 'string' || innerNode.type === 'ident';
  })
  .map(function(identifierNode) {
    return identifierNode.content.replace(/["']/g, '');
  });
}


export default  function getLessdependencies(content) {
  let dependencies = [];
  let ast;
  try {
    ast = gonzales.parse(content, { syntax: 'less' });
  } catch (e) {
    ast = {};
  }
  const walker = new Walker();
  walker.walk(ast, function(node) {
    if (!isImportStatement(node)) { return; }

    dependencies = dependencies.concat(extractDependencies(node));
  });

  return dependencies;
}