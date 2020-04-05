import getLessDependencies  from "./get-less-dependencies";

describe('get-less-dependencies', () => {
  const less = `
  @import "../themes/default";
  @import '../themes/icon';
  .scale-hairline-common(@color, @top, @right, @bottom, @left) {
    content: '';
    position: absolute;
    background-color: @color;
    display: block;
    z-index: 1;
    top: @top;
    right: @right;
    bottom: @bottom;
    left: @left;
  }
  
  .hairline(@direction, @color: @border-color-base) when (@direction = 'top') {
    border-top: 1PX solid @color;
  
    html:not([data-scale]) & {
      @media (min-resolution: 2dppx) {
        border-top: none;
  
        &::before {
          .scale-hairline-common(@color, 0, auto, auto, 0);
          width: 100%;
          height: 1PX;
          transform-origin: 50% 50%;
          transform: scaleY(0.5);
  
          @media (min-resolution: 3dppx) {
            transform: scaleY(0.33);
          }
        }
      }
    }
  }`
  test('get-less-dependencies', () => {
    expect(getLessDependencies(less)).toMatchObject(['../themes/default.less', '../themes/icon.less']);
  })
})