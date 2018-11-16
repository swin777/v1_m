<template lang="html">
<div class="centerAlign" v-show="visible" >
  <div>
    <img :src="srcUrl" style="width:45px; height:45px"/>
  </div>
</div>
</template>

<script lang="js">
  export default  {
    name: 'execute-mask',
    props: [],
    computed: {},
    mounted() {},
    created() {
			_eventBus.$on('executeStart', this.executeStartHandler);
      _eventBus.$on('executeEnd', this.executeEndHandler);
		},

    data() {
      return {
        visible: false,
        srcUrl: './staticImage/src/assets/images/loading.gif'
      }
    },
    
    methods: {
      executeStartHandler: function(){
        this.visible=true;
      },
      executeEndHandler: function(){
        this.visible=false;
      }
    }
}
</script>

<style scoped >
.centerAlign{
  padding-top: 100%; background:#000000; opacity:0.3; width:100%; height:100%; z-index:9999999; position:absolute; text-align: center
}
</style>
