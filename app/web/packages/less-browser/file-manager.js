/* global window, XMLHttpRequest */
import Transpiler from '../client-webpack/lib/transpiler/transpiler';
import AbstractFileManager from '../less/environment/abstract-file-manager.js';
import path from 'path'
import { normalize } from '@/utils/path'
let options;
let logger;
let fileCache = {};

// TODOS - move log somewhere. pathDiff and doing something similar in node. use pathDiff in the other browser file for the initial load
class FileManager extends AbstractFileManager {
    getPath(filename) {
        const { dir } = path.parse(filename);
        // console.log(dir)
        return dir || '';
        // let j = filename.lastIndexOf('?');
        // if (j > 0) {
        //     filename = filename.slice(0, j);
        // }
        // j = filename.lastIndexOf('/');
        // if (j < 0) {
        //     j = filename.lastIndexOf('\\');
        // }
        // if (j < 0) {
        //     return '';
        // }
        // return filename.slice(0, j + 1);

    }
    alwaysMakePathsAbsolute() {
        return true;
    }

    join(basePath, laterPath) {
        if (!basePath) {
            return laterPath;
        }
        return this.extractUrlParts(laterPath, basePath).path;
    }
    supports() {
        return true;
    }

    clearFileCache() {
        fileCache = {};
    }

    loadFile(filename, currentDirectory, options, environment) {
        // TODO: Add prefix support like less-node?
        // What about multiple paths?
        // if (currentDirectory && !this.isPathAbsolute(filename)) {
        //     filename = currentDirectory + filename;
        // }
        if(path.parse(filename).ext === '') {
            filename = `${filename}.less`
        }
        options = options || {};

        // sheet may be set to the stylesheet for the initial load or a collection of properties including
        // some context variables for imports
        // const hrefParts = this.extractUrlParts(filename, window.location.href);
        // const href      = hrefParts.url;
        const { pluginManager: { less: { options: { parentPath }}}} = options;
        const href = normalize(path.resolve(currentDirectory, filename))
        return new Promise((resolve, reject) => {
            // if (options.useFileCache && fileCache[href]) {
            //     try {
            //         const lessText = fileCache[href];
            //         return resolve({ contents: lessText, filename: href, webInfo: { lastModified: new Date() }});
            //     } catch (e) {
            //         return reject({ filename: href, message: `Error loading file ${href} error was ${e.message}` });
            //     }
            // }
            const targerTranspiler = Transpiler.getTranspilerModuleByPath(href);
            if (!!targerTranspiler) {
                resolve({contents: targerTranspiler.code, filename: href, webInfo: { lastModified: new Date() }});
            } else {
                // resolve({contents: '', filename: parentPath, webI nfo: { lastModified: new Date() }});
                reject({ type: 'File', message: `'${href}' wasn't found`, href });
            }
        });
    }
}

export default (opts, log) => {
    options = opts;
    logger = log;
    return FileManager;
}
