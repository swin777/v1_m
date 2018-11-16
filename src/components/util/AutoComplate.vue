<template lang="html">
  <div class="wrap_inpbox" id="wrap_searchA" v-show="visible" style="position:absolute!important" v-bind:style="{top:top?top+'px':'40px'}">
    <ul class="list_serC">
      <li v-for="item in suggests">
        <a href="javascript:void(0)" @click="suggestClick(item)">
          <span class="wrap_serC"><strong class="tit_serC"></strong>{{item.terms}}</span>
        </a> 
      </li>
    </ul>
  </div>
</template>

<script lang="js">
  export default  {
    name: 'auto-complate',
    props: {
      keyWord:{type:String, required:true},
      top:{type:Number, required:false}
    },

    mounted() {},

    data() {
      return {
        visible: false,
        autoComplateTimer: null,
        autoKeyword: '',
        guidVal: null,
        suggests:[]
      }
    },

    methods: {
      autoComplateHandler: function(){
        var me = this;
        me.guidVal = _app.guid();
        var point = olleh.maps.LatLng.valueOf(_map.getCenter());
        if(me.keyWord!=''){
          me.visible = true;
        }
        me.autoComplateTimer = setInterval(function() {
          if(me.keyWord!='' && me.autoKeyword != me.keyWord){
            me.autoKeyword = me.keyWord;
            me.visible = true;
            me.suggests = null;
            $.ajax({
                url: _app.geomasterUrl+"/search/v1.0/utilities/autocomplete?guid="+me.guidVal,
                type: "post",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify({"terms":me.keyWord, "point":{"lat":point.y, "lng":point.x}}),
                success: function(result) {
                    var remberGuidVal = this.url.split('guid=')[1];
                    if(remberGuidVal==me.guidVal && result.suggests){
                        me.suggests = result.suggests;
                    }
                },
                error: function(err){
                }
              });
          }else if(me.keyWord==''){
            me.hide();
          }
        },500);
      },

      autoComplatEnd: function(){
        var me = this;
        me.hide();
        if(me.autoComplateTimer){
          clearInterval(me.autoComplateTimer);
          me.autoComplateTimer = null;
        }   
      },

      suggestClick: function(item){
        var me = this;
        if(me.autoComplateTimer){
          clearInterval(me.autoComplateTimer);
          me.autoComplateTimer = null;
        }   
        me.hide();
        this.$emit('keyWordSelect', item.terms)
      },

      hide(){
        var me = this;
        me.visible = false;
        me.autoKeyword = "";
      }
    },

    computed: {}
}
</script>

<style scoped>
</style>