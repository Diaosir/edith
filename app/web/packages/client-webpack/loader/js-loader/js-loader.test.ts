import BabelLoader from './index'
describe('babel-loader-test', () => {
    const babelLoader = new BabelLoader({
        path: ''
    });
    console.log(babelLoader)
    test('translate es6', async () => {
        const js = `
        import '../uibdex.js'
        `
        const result = await babelLoader.translate(js);
        console.log(result)
    })

    // test('translate worker', async () => {
    //     let code = `onmessage = e => postMessage(e.data*2)`
    //     let worker = new Worker(URL.createObjectURL(new Blob([code])))
    //     worker.onmessage = console.log
    //     worker.postMessage(5)

    // })
})