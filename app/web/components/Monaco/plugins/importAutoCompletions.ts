export default function registerImportAutoCompletions(monaco, options) {
  monaco.languages.registerCompletionItemProvider('typescript', {
    triggerCharacters: ['"', "'", '.'],
    provideCompletionItems: (model, position) => {
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
        /(([\s|\n]from\s)|(\brequire\b\())["|']\.*$/.test(textUntilPosition)
      ) {
        console.log(textUntilPosition)
        suggestions.push({
          label: 'aa.js',
          insertText: 'aaaa',
          kind: monaco.languages.CompletionItemKind.File
        })
        if (textUntilPosition.endsWith('.')) {
          const prefix = textUntilPosition.match(/[./]+$/)[0];
          console.log(prefix)
        }
      }
      return {
        suggestions
      }
    }
  });
}