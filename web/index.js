
import dragTimeline from './src/components/dragTimeline'
import _Vue from 'vue'

dragTimeline.install = Vue => {
if (!Vue) {
window.Vue = Vue = _Vue
}
Vue.component(dragTimeline.name, dragTimeline)
}
export default dragTimeline;