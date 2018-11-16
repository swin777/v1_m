<template lang="html">
<div class="wrap_area" :style="{width:btnBarVisible?'-webkit-fill-available':'40px'}" v-show="visible">
  <a href="javascript:void(0)" class="btn_present"><img src="../assets/images/btn_thema.png" alt="테마" @click="btnBarVisible=true"/></a>
  <div class="wrap_facilty" v-show="btnBarVisible">
    <a href="javascript:void(0)" class="close_facilty"><img src="../assets/images/btn_close_m.png" alt="닫기" @click="btnBarVisible=false"/></a>
    <div class="header_facilty">테마</div>
    <div class="body_facilty">
      <ul>
        <li v-for="thema in themaInfo1">
          <a href="javascript:void(0)" :class="{selectBtn:currThemaCode==thema.code}" @click="currThemaCode!=thema.code?currThemaCode=thema.code:currThemaCode=null; themaCall(true)">
            <img :src="thema.img" :alt="thema.name"/>
            <span>{{thema.name}}</span>
          </a>
        </li>
      </ul>
      <ul>
        <li v-for="thema in themaInfo2">
          <a href="javascript:void(0)" :class="{selectBtn:currThemaCode==thema.code}" @click="currThemaCode!=thema.code?currThemaCode=thema.code:currThemaCode=null; themaCall(true)">
            <img :src="thema.img" :alt="thema.name"/>
            <span>{{thema.name}}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>			
</template>

<script lang="js">
  import * as Enumerable from "linq-es2015"; 

  export default  {
    name: 'thema-layer',
    props: {
      visible:{type:Boolean, default:true}
    },
    mounted() {},
    computed: {},
    created() {
      _eventBus.$on('mapIdle', this.mapIdleHandler);
      _eventBus.$on('mapMoveByThema', this.mapMoveByThema);
		},
    data() {
      return {
        btnBarVisible: false,
        themaInfo1:[
          {img:'./staticImage/src/assets/images/ico_gas.jpg', name:'주유소', code:'TM_001'},
          {img:'./staticImage/src/assets/images/ico_lpg.jpg', name:'LPG', code:'TM_002'},
          {img:'./staticImage/src/assets/images/ico_parking.jpg', name:'주차장', code:'TM_003'},
          {img:'./staticImage/src/assets/images/ico_clean.jpg', name:'세차장', code:'TM_004'},
          {img:'./staticImage/src/assets/images/ico_restaurant.jpg', name:'음식점', code:'TM_005'},
          {img:'./staticImage/src/assets/images/ico_hotel.jpg', name:'숙박', code:'TM_006'}
        ],
        themaInfo2:[
          {img:'./staticImage/src/assets/images/ico_bank.jpg', name:'은행/ATM', code:'TM_007'},
          {img:'./staticImage/src/assets/images/ico_mart.jpg', name:'대형마트', code:'TM_008'},
          {img:'./staticImage/src/assets/images/ico_gro.jpg', name:'편의점', code:'TM_009'},
          {img:'./staticImage/src/assets/images/ico_hospital.jpg', name:'병원', code:'TM_010'},
          {img:'./staticImage/src/assets/images/ico_pham.jpg', name:'약국', code:'TM_011'},
          {img:'./staticImage/src/assets/images/ico_toilet.jpg', name:'화장실', code:'TM_012'}
        ],
        currThemaCode: null,
        resultPois: null,
        currMakers: [],
        guidVal:null
      }
    },

    watch: {
      currThemaCode: function(val){
        if(val){
          _eventBus.$emit('themaOnOff', true);
        }else{
          _eventBus.$emit('themaOnOff', false);
        }
      },

      visible: function(val){
        if(val){
          this.markerVisible();
        }else{
          this.markerClear();
        }
      }
    },

    methods: {
      mapIdleHandler: function(){
        if(this.visible){
          this.themaCall(false);
        }
      },

      themaCall: function(zoomChange){
        var me = this;
        me.btnBarVisible=false
        me.markerClear();
        if(!me.currThemaCode){
          return;
        }
        if(zoomChange){
          _map.setZoom(11);
        }
        // if(_map.getZoom()<11){
        //   return;
        // }
        me.guidVal = _app.guid();
        var start = 0;
        var lefBottom = olleh.maps.LatLng.valueOf(_map.getBounds().leftBottom);
        var rightTop = olleh.maps.LatLng.valueOf(_map.getBounds().rightTop);
        var point = olleh.maps.LatLng.valueOf(_map.getCenter());
        $.ajax({
        url: _app.geomasterUrl+"/search/v1.0/pois?numberOfResults=20&start="+start+"&guid="+me.guidVal,
        type: "post",
        contentType: "application/json",
        dataType: "json",
			  data: JSON.stringify({
          "theme":{"code":[me.currThemaCode]},
          "bound":{"left":lefBottom.x, "bottom":lefBottom.y, "right":rightTop.x, "top":rightTop.y},
          "point":{"lat":point.y, "lng":point.x}
        }),
			  success: function(result) {
          var remberGuidVal = this.url.split('guid=')[1];
          if(remberGuidVal==me.guidVal){
            me.searchResult = result;
            me.mapDisplay();
            _eventBus.$emit('themaCallComplate', result);
          }
        },
        error: function(err){}
        });
      },

      mapDisplay: function(){
        var me = this;
        if(_map.getZoom()<11){
          _map.setZoom(11);
        }
        var markerImgUrl=null;
        Enumerable.asEnumerable(this.themaInfo1).Union(this.themaInfo2).Where(function(thmea){ return thmea.code == me.currThemaCode }).ToArray().forEach((thema, idx) => {
          markerImgUrl = thema.img;
        });
        me.searchResult.pois.forEach((element, idx) => {
          var latLngPoint = new olleh.maps.LatLng(element.point.lat, element.point.lng);
          var point = olleh.maps.UTMK.valueOf(latLngPoint)
          var marker = new olleh.maps.overlay.Marker({
            map:_map,
            position: point,
            icon:{url:markerImgUrl, size: new olleh.maps.Size(22, 22)},
          });
          marker.id = element.id;
          marker.onEvent('click', function(e) {
            _eventBus.$emit('themaMarkerClick', marker.id);
          });
          me.currMakers.push(marker);
        });
      },

      markerClear: function(){
        this.currMakers.forEach((marker, idx) => {
          marker.setMap(null);
        });
        this.currMakers = [];
      },

      markerVisible: function(val){
        this.currMakers.forEach((marker, idx) => {
          marker.setMap(val?_map:null);
        });
        if(val && this.bound){
          _map.fitBounds(this.bound);
        }
      },

      mapMoveByThema: function(poi){
        var me = this;
        _eventBus.$off('mapIdle', this.mapIdleHandler);
        if(me.timer){
          clearInterval(me.timer);
        }
        if(me.timer2){
          clearInterval(me.timer2);
        }
        if(_map.getZoom()<11){
          _map.setZoom(11);
        }
        me.currMakers.forEach((marker, idx) => {
          marker.setZIndex(841683);
          if(marker.id == poi.id){
            marker.setZIndex(olleh.maps.overlay.BaseOverlay.MAX_ZINDEX);
            me.timer = setInterval(function() {
              clearInterval(me.timer);
              var position = marker.getPosition();
              _map.setCenter(position);
            },500);
          }
        });
        me.timer2 = setInterval(function() {
          clearInterval(me.timer2);
          _eventBus.$on('mapIdle', me.mapIdleHandler);
        },1500);
      }
    }
}
</script>

<style scoped>
.selectBtn{background: #00ff00}
</style>