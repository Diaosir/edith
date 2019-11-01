https://d1jyvh0kxilfa7.cloudfront.net/v1/combinations/babel-runtime@7.3.1.json
https://aiwi8rnkp5.execute-api.eu-west-1.amazonaws.com/prod/packages/%40babel%2Fruntime%407.3.1+csbbust%401.0.0+index.js%400.0.3+is%403.3.0+react%4016.8.6+react-dom%4016.11.0+terminal-in-react%404.3.1

# monaco typescript

existingLib = this.monaco.languages.typescript.typescriptDefaults.getExtraLibs
this.monaco.languages.typescript.typescriptDefaults._extraLibs[
  fullPath
] = code;

this.monaco.languages.typescript.typescriptDefaults._onDidChange.fire(
  this.monaco.languages.typescript.typescriptDefaults
);

this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: !this.hasNativeTypescript(),
});

### 动态添加d.ts

monaco.languages.typescript.typescriptDefaults.addExtraLib(content: string, filepath?: string);

```
const model = this.monaco.editor.createModel(
  module.code || '',
  mode === 'javascript' ? 'typescript' : mode,
  new this.monaco.Uri({ path, scheme: 'file' })
);

```