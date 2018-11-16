import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

window._eventBus = new Vue();

window._vue = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

window._app = {
  geomasterUrl:"geomaster",

  guid: function(){
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  },

  roundNumber: function(num, scale) {
    if(!("" + num).includes("e")) {
      return +(Math.round(num + "e+" + scale)  + "e-" + scale);
    } else {
      var arr = ("" + num).split("e");
      var sig = ""
      if(+arr[1] + scale > 0) {
        sig = "+";
      }
      return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
  }
}