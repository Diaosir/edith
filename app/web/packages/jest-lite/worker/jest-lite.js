const ctx = self
super.importScripts(['http://unpkg.com/jest-lite@1.0.0-alpha.4/dist/core.js', 'http://unpkg.com/jest-lite@1.0.0-alpha.4/dist/enzyme.js', 'http://unpkg.com/jest-lite@1.0.0-alpha.4/dist/prettify.js']);


ctx.addEventListener("message", (event ) => {
    const { data } = event;
    console.log(data);
});
function runJest() {

}