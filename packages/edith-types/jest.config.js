'use strict';
const path = require('path');
module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
  preset: 'ts-jest',
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^edith-utils/(.*)$': `${path.join(__dirname, '../edith-utils')}/$1`,
    '^edith-types/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.ts?(x)$': 'ts-jest',
    '^.+\\.js$': './node_modules/babel-jest',
  },
  testMatch: [
    '**/?(*.)(spec|test).ts?(x)',
  ],
};
