import 'bootstrap/dist/css/bootstrap.css';
// import 'https://fonts.googleapis.com/earlyaccess/cwtexkai.css';
import Vue from 'vue'
import App from './App.vue'
import store from './store';

Vue.config.productionTip = false

new Vue({
    store,
    render: h => h(App),
}).$mount('#app')