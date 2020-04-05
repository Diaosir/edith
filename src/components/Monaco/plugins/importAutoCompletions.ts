import * as path from 'path'
import File, { FileType } from 'edith-types/lib/file';
let isFirstRegister = true;
export default function registerImportAutoCompletions(monaco, options) {
  if (!isFirstRegister) {
    return;
  }
  monaco.languages.registerCompletionItemProvider('typescript', {
    triggerCharacters: ['"', "'", '/'],
    provideCompletionItems: (model, position) => {
      const filename = model.uri.path;
      const textUntilPosition = model.getValueInRange(
        {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        1
      );
      var suggestions = [];
      if (
        /(([\s|\n]from\s)|(\brequire\b\())["|']\S*$/.test(textUntilPosition)
      ) {
        if (textUntilPosition.endsWith('/')) {
          const prefix = textUntilPosition.match(/["|'](\S*)$/)[1];
          const relativePath = path.join(path.dirname(filename), prefix);
          let chilrenFiles: Array<File> = []
          if(relativePath === '/') {
            chilrenFiles = options.modules;
          } else {
            File.recursion(options.modules, function(file) {
              if (`/${file.path}/` === relativePath) {
                chilrenFiles = file.children;
              }
            })
          }
          return {
            suggestions: chilrenFiles.map(file => {
              let filePath = file.path.replace(new RegExp(`^${relativePath.slice(1)}`), '');
              let insertText = filePath
              if(filePath.endsWith('.js')) {
                insertText = filePath.replace(/\.js$/, '')
              }
              if (filePath.endsWith('.ts')) {
                insertText = filePath.replace(/\.ts$/, '');
              }
              return {
                label: filePath,
                insertText: insertText,
                detail: filePath,
                kind: file.type === FileType.FOLDER ? monaco.languages.CompletionItemKind.Folder : monaco.languages.CompletionItemKind.File
              }
            })
          }
        }
        const dependencies = options.dependencies;
        if (dependencies) {
          return {
            suggestions: Object.keys(dependencies).map(name => ({
              label: name,
              detail: dependencies[name],
              insertText: name,
              kind: monaco.languages.CompletionItemKind.Module
            }))
          }
        }
      }
      return {
        suggestions
      }
    }
  });
  isFirstRegister = false;
}