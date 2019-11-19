import { Service } from 'egg';
//import fs from 'fs'
const glob = require('glob')
const path = require('path');
const fs = require('fs')

export default class VscodeService extends Service {
  async getExtensionsConfig() {
    const EXTENSIONS_ROOT = path.join(this.config.baseDir, 'packages/vscode-extensions');
    const extensionFolders = fs.readdirSync(EXTENSIONS_ROOT);
    const mapExtensionFolderToExtensionPackageJSON = new Map();
    await Promise.all(extensionFolders.map(async extensionFolder => {
      try {
        const packageJSON = JSON.parse(fs.readFileSync(path.join(EXTENSIONS_ROOT, extensionFolder, 'package.json'), { encoding: 'utf-8'}));
        packageJSON.extensionKind = 'web'; // enable for Web
        mapExtensionFolderToExtensionPackageJSON.set(extensionFolder, packageJSON);
      } catch(error) {
        return null;
      }
    }));
    const staticExtensions = [];
    // Built in extensions
    mapExtensionFolderToExtensionPackageJSON.forEach((packageJSON, extensionFolder) => {
      staticExtensions.push({
        packageJSON,
        extensionLocation: { scheme: 'http', authority: 'localhost:7001', path: `/static-extension/${extensionFolder}` }
      });
    });
    return staticExtensions;
  }
}

