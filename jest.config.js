module.exports = {
  "globals": {
    'ts-jest': {
      "tsConfig": 'tsconfig.jest.json'
    }
  },
  "preset": 'ts-jest',
  "testEnvironment": 'node',
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
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  },
  "testMatch": [
    "<rootDir>/app/**/?(*.)(spec|test).ts?(x)"
  ]
};