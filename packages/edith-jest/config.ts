export default {
  "globals": {
  },
  "preset": 'ts-jest',
  "moduleFileExtensions": [
    "js",
    "ts",
    "tsx"
  ],
  "transform": {
    "^.+\\.ts?(x)$": "babel-loader",
    '^.+\\.js$': 'babel-loader'
  },
  "testMatch": [
    "**/?(*.)(spec|test).ts?(x)"
  ],
}