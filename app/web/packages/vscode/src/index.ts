import configuration from './config';
function createScript(src, onload) {
  var script = document.createElement('script');
  script.src = src;
  script.addEventListener('load', onload);

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.lastChild);
}
const global = window as {[key: string]: any};

var globals = {
  globalSettingsValue: undefined,
  programStart: Date.now(),
  vscodeStart: Date.now(),
};
var electron = {
  'remote': {
    'getCurrentWindow': function () {
      return {
        'id': 1
      }
    },
    'getGlobal': function (key) {
      return globals[key];
    }
  },
  'ipcRenderer': {
    'send': function (message, value) {
      console.log('ipcRenderer.send: ' + message + ', ' + value);
    }
  }
};
var remote = electron.remote;

export class Vscode {
  async initLoader(){
    return new Promise((resolve, reject) => {
      createScript(`${configuration.rootPath}/static/out/vs/loader.js`, function() {
        // var nlsConfig;
        // try {
        //   // TODO: var config = process.env['VSCODE_NLS_CONFIG'];
        //   var config = null;
        //   if (config) {
        //     nlsConfig = JSON.parse(config);
        //   }
        // } catch (e) {
        // }
        // if (!nlsConfig) {
        //   nlsConfig = { availableLanguages: {} };
        // } else {
        //   var locale = nlsConfig.availableLanguages['*'] || 'en';
        //   if (locale === 'zh-tw') {
        //     locale = 'zh-Hant';
        //   } else if (locale === 'zh-cn') {
        //     locale = 'zh-Hans';
        //   }
        //   window.document.documentElement.setAttribute('lang', locale);
        // }
        // global.require.config({
        //   baseUrl: configuration.rootPath,
        //   'vs/nls': nlsConfig,
        //   ignoreDuplicateModules: [
        //     'vs/workbench/parts/search/common/searchQuery'
        //   ],
        //   paths: {
        //     'vs/basic-languages': 'monaco-languages',
        //     'vs/language/typescript': 'monaco-typescript',
        //     'vs/language/json': 'monaco-json',
        //     'vs/language/css': 'monaco-css'
        //   }
        // });
        // if (nlsConfig.pseudo) {
        //   global.require(['vs/nls'], function(nlsPlugin) {
        //     nlsPlugin.setPseudoTranslation(nlsConfig.pseudo);
        //   });
        // }
        // global.MonacoEnvironment = {
        //   'enableTasks': configuration.workspacePath,
        //   'enableSendASmile' : !!configuration.sendASmile
        // };
        // var timers: any = global.MonacoEnvironment.timers = {
        //   start: new Date()
        // };
        // timers.beforeLoad = new Date();

        // global.require(['vs/workbench/workbench.main'], function() {
        //   timers.afterLoad = new Date();
        //   var main = global.require('vs/workbench/electron-browser/main');
        //   main.startup(configuration, {
        //     settings: {},
				// 		keybindings: []
        //   }).then(function() {
        //     // Remove the progress indicator and related startup styles
        //     var elBody = document.getElementsByTagName("body")[0];
        //   }, function(error) { 
        //     console.log(error)
        //    });
        // })


        global.require.config({
          baseUrl: `${configuration.rootPath}/static/out`,
          paths: {
            'vs/basic-languages': 'monaco-languages',
            'vs/language/typescript': 'monaco-typescript',
            'vs/language/json': 'monaco-json',
            'vs/language/css': 'monaco-css',
            'vscode-textmate': `${configuration.rootPath}/static/remote/web/node_modules/vscode-textmate/release/main`,
            'onigasm-umd': `${configuration.rootPath}/static/remote/web/node_modules/onigasm-umd/release/main`,
            'xterm': `${configuration.rootPath}/static/remote/web/node_modules/xterm/lib/xterm.js`,
            'xterm-addon-search': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-search/lib/xterm-addon-search.js`,
            'xterm-addon-web-links': `${configuration.rootPath}/static/remote/web/node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js`,
            'semver-umd': `${configuration.rootPath}/static/remote/web/node_modules/semver-umd/lib/semver-umd.js`,
          }
        })
        global.require(['vs/code/browser/workbench/workbench'], function(workbench) {
        });
      })
    })
  }
}

export default new Vscode()
