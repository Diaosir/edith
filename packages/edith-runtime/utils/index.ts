import Module from 'edith-runtime/lib/module'
export function setStylesheet(code, id) {
    let targertStyle = <HTMLStyleElement>document.getElementById(id);
    if (!targertStyle) {
        targertStyle = document.createElement('style');
        targertStyle.type = 'text/css';
        targertStyle.id = id;
        document.getElementsByTagName('head').item(0).appendChild(targertStyle);
    }
    targertStyle.innerHTML = code;
}
export function deleteStylesheet(id) {
    let targertStyle = <HTMLStyleElement>document.getElementById(id);
    if (targertStyle) {
        targertStyle.parentElement.removeChild(targertStyle)
    }
}
export async function getDependenciesModulesFiles(modules: Map<string, Module>, filter: (module: Module) => boolean): Promise<{[key: string]: string}>{
    const moduleValues: Array<Module> = Array.from(modules.values())
    const res: any= {}
    await Promise.all(moduleValues
      .filter(module => { return typeof filter === 'function' ? filter(module) : true})
      .map( async (module) => {
        const code = await module.getCode();
        res[module.path] = code;
        return {
          path: module.path,
          code
        }
      })
    )
    return res;
  }