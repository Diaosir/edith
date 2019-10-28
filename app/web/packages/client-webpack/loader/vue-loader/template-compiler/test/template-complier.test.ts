import templateComplier from '../index';
describe('TemplateComplier', () => {
  test('TemplateComplier', async () => {
    const result = await templateComplier.translate('<div ok><h1 :class="$style.red">hello</h1></div>', {
      resourceQuery: '?vue&type=template&id=27e4e96e&{ outputSourceRange: true, scopeId: null, comments: undefined }'
    });
    console.log(result)
  })
})