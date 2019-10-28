<template>
  <div id="app">
  huangzhen
  <Hello></Hello>
  </div>
</template>

<script>
import Hello from './components/HelloWorld.vue'
// import * as Util from './utils';
export default {
  name: 'App',
  components: {
    Hello
  }
}
</script>
<style lang='less'>
    @import './less/index.less';
    #app{
        margin: 10px;
    }
</style>