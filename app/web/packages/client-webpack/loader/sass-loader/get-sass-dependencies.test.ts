import getSassDependencies  from "./get-sass-dependencies";

describe('get-less-dependencies', () => {
  const scss = `
  @import './base.scss';
body{
  background: #000;
  height: 100px;
  width: 100px;
}`
  test('get-less-dependencies', () => {
    expect(getSassDependencies(scss)).toMatchObject(['./base.scss']);
  })
})