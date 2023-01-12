<template>
    <div class="container header">
        <div class="d-flex header__title">
            <h1>戰國風雲加強0.1版</h1>
        </div>
    </div>
</template>

<script>
export default {
  name: 'topHeader',
  data(){
    return{
        // vueEnv : process.env.VUE_APP_ENV
    }
  },
  props: {
  }
}
</script>

<style scoped>
 .header__title{
    margin-top:10px;
 }
</style>
