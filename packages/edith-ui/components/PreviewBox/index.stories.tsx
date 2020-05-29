import React from 'react';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from '@material-ui/core/styles';
import PreviewBox from './index';
interface MyTheme {
  background: string;
  boxShadow: string;
}
export default {
  component: PreviewBox,
  title: 'PreviewBox',
  excludeStories: /.*Data$/
};

export const actionsData = {
  onPinTask: action('onPinTask'),
  onArchiveTask: action('onArchiveTask'),
};

export const Default = () => <PreviewBox {...actionsData} />;
export const withTheme = () => (
  <ThemeProvider<MyTheme>
    theme={{
      background: '#2b2e41',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    }}
  >
    <PreviewBox />
  </ThemeProvider>
)