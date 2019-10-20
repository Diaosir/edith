module.exports = {
  "globals": {
    'ts-jest': {
      "tsConfig": 'tsconfig.jest.json'
    }
  },
  "preset": 'ts-jest',
  "moduleFileExtensions": [
    "js",
    "ts",
    "tsx"
  ],
  "moduleNameMapper": {
    "\\.(css|scss)$": "identity-obj-proxy"
  },
  "transform": {
    "^.+\\.ts?(x)$": "ts-jest",
    '^.+\\.js$': '../../node_modules/babel-jest'
  },
  "testMatch": [
    "**/?(*.)(spec|test).ts?(x)"
  ],
  "setupFiles": [
    "jsdom-worker"
  ]
};