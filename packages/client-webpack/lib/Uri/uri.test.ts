import { URI } from './index'
describe('uri test', () => {
    /**
    .replace(/^-?!+/, "")
    .replace(/!!+/g, "!")
    .split("!");
     */
    test('new uri by full string', () => {
        const code = '!!vue-style-loader!css-loader!../../lib/style-compiler/index?{\"vue\":true,\"id\":\"data-v-793be54c\",\"scoped\":false,\"hasInlineConfig\":false}!../../lib/selector?type=styles&index=0&bustCache!./basic.vue'
        const uri = URI.parse(code);
        console.log(uri)
    })
    test('uri test' ,() => {
        const code = '!!vue-style-loader!css-loader!../../lib/style-compiler/index?{\"vue\":true,\"id\":\"data-v-793be54c\",\"scoped\":false,\"hasInlineConfig\":false}!../../lib/selector?type=styles&index=0&bustCache!./basic.vue'

        console.log(code.replace(/^-?!+/, "")
        .replace(/!!+/g, "!")
        .split("!"))
    })
})
 