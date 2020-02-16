<template>
  <div>
    <dragTimeline></dragTimeline>  
  </div>
</template>

<script>
import dragTimeline from './components/dragTimeline'
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components:{
        dragTimeline
    },
}
</script>

<style>



</style>
