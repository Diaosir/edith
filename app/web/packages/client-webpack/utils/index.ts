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