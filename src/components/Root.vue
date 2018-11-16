<template lang="html">
<div>
  <div id="container2" ref="mapContainer">
    <div id="content" ref="mapContent" style="height:100%">
        <geo-map ref="geoMap"></geo-map>
        <thema-layer :visible="poiSearchVisible"></thema-layer>
    </div>
  </div>
  <left-side :visible="leftSideVisible" @leftSideHide="leftSideHideHandler" @movePoi="movePoiHandler" @moveRoute="moveRouteHandler"></left-side>
  <poi-search :visible="poiSearchVisible" @moveRoute="moveRouteHandler" @leftSideShow="leftSideShowHandler"></poi-search>
  <route-search :visible="routeSearchVisible" @movePoi="movePoiHandler" ref="routeSearch"></route-search>
  <execute-mask></execute-mask>
</div>
</template>

<script lang="js">
  import PoiSearch from '@/components/PoiSearch'
  import RouteSearch from '@/components/RouteSearch'
  import GeoMap from '@/components/GeoMap'
  import ThemaLayer from '@/components/ThemaLayer'
  import LeftSide from '@/components/LeftSide'
  import ExecuteMask from '@/components/util/ExecuteMask'
  export default  {
    name: 'root',
    props: [],
    components:{PoiSearch, RouteSearch, GeoMap, ThemaLayer, LeftSide, ExecuteMask},
    computed: {},

    mounted() {
      var me = this;
      me.$refs.mapContainer.addEventListener("touchstart", function(e) {
        if(!(e.target.style.backgroundImage && e.target.style.backgroundImage.split('staticImage').length > 1) && e.target.tagName.toUpperCase()!="IMG"){
          e.preventDefault(), me.$refs.mapContent.dispatchEvent(new Event("touchstart"))
        }
      }, false)
      me.$refs.mapContainer.addEventListener("touchmove", function(e) {
        if(!(e.target.style.backgroundImage && e.target.style.backgroundImage.split('staticImage').length > 1)){
          e.preventDefault(), me.$refs.mapContent.dispatchEvent(new Event("touchmove"))
        }
      }, false)
      me.$refs.geoMap.initMap(me.$refs.mapContent);
    },

    data() {
      return {
        poiSearchVisible: true,
        routeSearchVisible: false,
        leftSideVisible: false
      }
    },

    methods: {
      moveRouteHandler: function(poi){
        this.poiSearchVisible = false;
        this.routeSearchVisible = true;
        this.$refs.routeSearch.directKeyWordSelect(poi);
      },

      movePoiHandler: function(){
        this.poiSearchVisible = true;
        this.routeSearchVisible = false;
      },

      leftSideShowHandler: function(){
        this.leftSideVisible = true;
      },

      leftSideHideHandler: function(){
        this.leftSideVisible = false;
      },
    }
}
</script>

<style scoped>
</style>