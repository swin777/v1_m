<template lang="html">
<div class="geo_box" v-show="visible"> 
  <div class="wrap_Gsearch" id="geo_box01">
    <button class="btn_all btn_d" @click="leftSideShow">전체보기</button>
      <span class="seach_inp">
        <input type="text" title="검색어 입력해주세요" placeholder="검색어 입력해주세요" class="input_act" v-model="keyWord" @focus="keyWordFocus" @focusout="keyWordFocusOut" @input="typing"/>
        <span class="btn_search"  id="searchBox" @click="poiSearchClick">검색</span>
      </span>
      <button class="btn_road" @click="moveRouteClick">길찾기 전환 버튼</button> 
      <auto-complate :keyWord="keyWord" @keyWordSelect="keyWordSelectHandler" ref="autoComplate"></auto-complate>
  </div>
  <div class="layer_search"  id="wrap_searchB" v-show="resultAreaVisible" style="height: 99px; bottom: 0px;" v-bind:style="{top:wOpenStatus?'50%':'auto'}">
    <button class="tab_wOpen1" v-show="listResultBtnVisible" :style="{background:listResultSelect=='poi'?'#00ff00':'#cccccc'}" @click="listResultClick('poi')">POI</button>
    <button class="tab_wOpen2" v-show="listResultBtnVisible" :style="{background:listResultSelect=='thema'?'#00ff00':'#cccccc'}" @click="listResultClick('thema')">테마</button>
    <button class="btn_wOpen" v-show="wOpenStatus" @click="wsToggle">클릭버튼</button>
    <button class="btn_wClose" v-show="!wOpenStatus" @click="wsToggle">닫기버튼</button>
    <div id="height_serC" ref="poiResultArea" v-bind:style="{position:wOpenStatus?'fixed':'relative', display:wOpenStatus?'block':selPoi?'none':'block'}">
      <swiper ref="mySwiper" @slideNextTransitionEnd="slideNextTransitionEnd" @slidePrevTransitionEnd="slidePrevTransitionEnd" v-show="listResultSelect=='poi'">
        <swiper-slide v-for="slide in slides" :key="slide.id">
          <ul class="list_serC">
            <li v-for="poi in pois[slide]" style="min-height:99px;" v-bind:style="{background:selPoi&&selPoi.id==poi.id?'#adf1ad':''}" :ref="poi.id">
              <div :id="poi.id" :idx="poi.idx" @click="listClick(poi)">
                <span class="wrap_serC"><strong class="tit_serC">{{poi.name + poi.branch + poi.subName}}</strong> <span class="fr">{{poi.category}}</span></span>
                <p><span>{{poi.distance}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{poi.phone}}</a></span></p>
                <p>{{poi.address}}</p>
              </div> 
              <span class="tranbtn"><button class="btn_road02" @click="goRouteSearch(poi)">길찾기 전환</button></span>
            </li>
          </ul>
        </swiper-slide>
        <swiper-slide><div class="outer" v-show="keyWord!=''"><div class="inner"><div class="centered">조회중...</div></div></div></swiper-slide>
      </swiper>
      <ul class="list_serC" v-show="listResultSelect=='thema'">
        <li v-for="themaPoi in themaPois" style="min-height:99px;" v-bind:style="{background:seThemalPoi&&seThemalPoi.id==themaPoi.id?'#adf1ad':''}" :ref="themaPoi.id">
          <div :id="themaPoi.id" :idx="themaPoi.idx" @click="themaListClick(themaPoi)">
            <span class="wrap_serC"><strong class="tit_serC">{{themaPoi.name + themaPoi.branch + themaPoi.subName}}</strong> <span class="fr">{{themaPoi.category}}</span></span>
            <p><span>{{themaPoi.distance}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{themaPoi.phone}}</a></span></p>
            <p>{{themaPoi.address}}</p>
          </div> 
          <span class="tranbtn"><button class="btn_road02" @click="goRouteSearch(themaPoi)">길찾기 전환</button></span>
        </li>
      </ul>
    </div>
    <div id="height_serC2" ref="poiResultArea2" style="position:absolute;z-index:;width:100%;height:100%;bottom: 0px;" v-bind:style="{display:wOpenStatus?'none':selPoi||seThemalPoi?'block':'none'}">
      <ul class="list_serC" v-show="listResultSelect=='poi'">
        <li style="background:#adf1ad">
          <div @click="listClick(selPoi)">
            <span class="wrap_serC"><strong class="tit_serC">{{selPoi?selPoi.name + selPoi.branch + selPoi.subName:''}}</strong> <span class="fr">{{selPoi?selPoi.category:''}}</span></span>
            <p><span>{{selPoi?selPoi.distance:''}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{selPoi?selPoi.phone:''}}</a></span></p>
            <p>{{selPoi?selPoi.address:''}}</p>
          </div> 
          <span class="tranbtn"><button class="btn_road02" @click="goRouteSearch(selPoi)">길찾기 전환</button></span>
        </li>
      </ul>
      <ul class="list_serC" v-show="listResultSelect=='thema'">
        <li style="background:#adf1ad">
          <div @click="listClick(seThemalPoi)">
            <span class="wrap_serC"><strong class="tit_serC">{{seThemalPoi?seThemalPoi.name + seThemalPoi.branch + seThemalPoi.subName:''}}</strong> <span class="fr">{{seThemalPoi?seThemalPoi.category:''}}</span></span>
            <p><span>{{seThemalPoi?seThemalPoi.distance:''}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{seThemalPoi?seThemalPoi.phone:''}}</a></span></p>
            <p>{{seThemalPoi?seThemalPoi.address:''}}</p>
          </div> 
          <span class="tranbtn"><button class="btn_road02" @click="goRouteSearch(seThemalPoi)">길찾기 전환</button></span>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script lang="js">
import AutoComplate from '@/components/util/AutoComplate';
//import InfiniteLoading from 'vue-infinite-loading';
import { swiper, swiperSlide } from 'vue-awesome-swiper';
import 'swiper/dist/css/swiper.css';

export default  {
  name: 'poi-search',
  components:{AutoComplate, swiper, swiperSlide},
  computed: {},
  props: {
    visible:{type:Boolean, default:true}
  },
  data() {
    return {
      keyWord: '',
      resultAreaVisible: false,
      wOpenStatus: false,
      pageStart: 0,
      pageSize: 10,
      sortBy:'relevance',
      searchResult:null,
      pois:[],
      currMakers: [],
      slides:[],
      selPoi: null,
      listResultBtnVisible: false,
      listResultSelect: 'poi', //poi 또는 thema,
      poiListVsible: true,
      themaPois:[],
      seThemalPoi:null
    }
  },

  created() {
    _eventBus.$on('themaOnOff', this.themaOnOffHandler);
    _eventBus.$on('themaCallComplate', this.themaCallComplate);
    _eventBus.$on('themaMarkerClick', this.themaMarkerClick);
  },

  watch: {
    wOpenStatus: function(val){
      _eventBus.$emit('mapCover', {wOpenStatus:this.wOpenStatus, resultAreaVisible:this.resultAreaVisible});
    },

    visible: function(val){
      if(val){
        _eventBus.$emit('mapCover', {wOpenStatus:this.wOpenStatus, resultAreaVisible:this.resultAreaVisible});
      }
      this.markerVisible(val);
    }
  },

  mounted() {},
  
  methods: {
    typing: function(e){
      this.keyWord = e.target.value
    },

    poiSearchClick: function(){
      this.searchCall();
    },

    moveRouteClick: function(){
      this.goRouteSearch(null);
    },

    leftSideShow: function(){
      this.$emit('leftSideShow');
    },

    keyWordFocus: function(){
      this.$refs.autoComplate.autoComplateHandler();
    },

    keyWordFocusOut: function(){
      this.$refs.autoComplate.autoComplatEnd();
    },

    keyWordSelectHandler: function(terms){
      this.keyWord = terms;
      this.searchCall();
    },

    wsToggle: function(){
      this.wOpenStatus=!this.wOpenStatus;
    },

    searchCall: function(append, prev){
      var me = this;
      if(!append){
        me.pageStart = 0;
        me.pois = [];
        me.slides = [];
      }
      me.listResultSelect = 'poi';
      me.resultAreaVisible = true;
      me.wOpenStatus = true;
      var point = olleh.maps.LatLng.valueOf(_map.getCenter());
      $.ajax({
        url: _app.geomasterUrl+"/search/v1.0/pois?sortBy="+me.sortBy+"&numberOfResults="+me.pageSize+"&start="+me.pageStart,
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"terms":me.keyWord, "point":{"lat":point.y, "lng":point.x}}),
        success: function(result) {
          me.searchResult = result;
          me.slides.push(me.pageStart/10);
          if(me.searchResult.pois){
              me.resultDisplay();
              me.mapDisplay();
          }
        },
        error: function(err){}
      });
    },

    resultDisplay: function(){
      this.pois.push([]);
      this.searchResult.pois.forEach((element, idx) => {
        var phone = '';
        if(element.phones){
            if(element.phones.normal && element.phones.normal.length>0){
                phone = element.phones.normal[0];
            }
            if(element.phones.representation && element.phones.representation.length>0){
                phone = element.phones.representation[0];
            }
        }
        var distance = '';
        if(element.distance>999){
          distance = _app.roundNumber(element.distance/1000, 1) + 'km';
        }else{
          distance = _app.roundNumber(element.distance, 0) + 'm'
        }
        this.pois[this.pageStart/10].push({id:element.id, order:String.fromCharCode(65+idx), name:element.name, branch:' ' + element.branch, subName:element.subName?'('+element.subName+')':'',
          distance:distance, idx:idx+this.pageStart,
          phone:phone, category:element.category.middleName + " > " + element.category.subName,
          address:element.address.siDo + " " + element.address.siGunGu + " " + element.address.street + " " + element.address.streetNumber, point:element.point
        });
      })
    },

    mapDisplay: function(){
      var me = this;
      me.selPoi = null;
      me.markerClear();
      var bound = null;
      me.pois[this.pageStart/10].forEach((element, idx) => {
          var latLngPoint = new olleh.maps.LatLng(element.point.lat, element.point.lng);
          var point = olleh.maps.UTMK.valueOf(latLngPoint);
          var marker = new olleh.maps.overlay.Marker({
              position: point,
              icon:{url:'./staticImage/src/assets/images/ic_firm_'+String.fromCharCode(65+idx)+'.png'},
              map:_map
          });
          marker.id = element.id;
          marker.onEvent('click', function(e) {
            me.listSelect(marker.id);
          });
          me.currMakers.push(marker);
          bound = idx==0 ? new olleh.maps.Bounds(point, point) : bound.union(point);
      });
      if(bound){
        _map.fitBounds(bound);
      }
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

    listClick: function(poi){
      var me = this;
      me.selPoi = poi;
      me.selThemaPoi = null;
      if(me.boundTimer){
        clearInterval(me.boundTimer);
      }
      if(_map.getZoom()<11){
        _map.setZoom(11);
      }
      me.currMakers.forEach((marker, idx) => {
        marker.setZIndex(841683);
        if(marker.id == poi.id){
          marker.setZIndex(olleh.maps.overlay.BaseOverlay.MAX_ZINDEX);
          me.boundTimer = setInterval(function() {
            clearInterval(me.boundTimer);
            var position = marker.getPosition();
            _map.setCenter(position);
          },500);
        }
      });
    },

    listSelect: function(poiId){
      var me = this;
      me.listResultSelect = 'poi';
      var appendTop = 0;
      if(me.listSelectTimer){
        clearInterval(me.listSelectTimer);
      }
      me.listSelectTimer = setInterval(function() {
        clearInterval(me.listSelectTimer);
          me.pois[me.pageStart/10].forEach((poi, idx) => {
            if(poi.id == poiId){
              me.selPoi = poi;
              me.$refs.poiResultArea.scrollTop = appendTop;
              return;
            }else{
              appendTop += me.$refs[poi.id][0].offsetHeight;
            }
          });
      },500);
    },

    slideNextTransitionEnd: function(){
      this.$refs.poiResultArea.scrollTop = 0;
      if(this.pageStart+10 < this.searchResult.numberOfPois){
        this.pageStart += 10;
        if(this.pageStart/10 == this.slides.length){
          this.searchCall(true);
        }else{
          this.mapDisplay();
        }
      }else{
        
        this.$refs.mySwiper.swiper.slidePrev(null, null)
      }
    },

    slidePrevTransitionEnd: function(){
      this.$refs.poiResultArea.scrollTop = 0;
      if(this.pageStart!=0){
        this.pageStart -= 10;
        this.mapDisplay();
      }
    },

    goRouteSearch: function(poi){
      this.bound = _map.getBounds();
      this.$emit('moveRoute', poi);
    },

    themaOnOffHandler: function(vi){
      this.listResultBtnVisible = vi;
      if(!vi){
        this.listResultSelect = 'poi';
      }
    },

    listResultClick: function(mode){
      this.listResultSelect = mode;
    },

    themaCallComplate: function(result){
      if(!this.resultAreaVisible){
        this.wOpenStatus = true;
        this.resultAreaVisible = true;
        this.listResultBtnVisible = true;
        this.listResultSelect = 'thema';
      }
      this.themaPois = [];
      this.seThemalPoi =  this.seThemalPoi =null;
      result.pois.forEach((element, idx) => {
        var phone = '';
        if(element.phones){
            if(element.phones.normal && element.phones.normal.length>0){
                phone = element.phones.normal[0];
            }
            if(element.phones.representation && element.phones.representation.length>0){
                phone = element.phones.representation[0];
            }
        }
        var distance = '';
        if(element.distance>999){
          distance = _app.roundNumber(element.distance/1000, 1) + 'km';
        }else{
          distance = _app.roundNumber(element.distance, 0) + 'm'
        }
        this.themaPois.push({id:element.id, order:String.fromCharCode(65+idx), name:element.name, branch:' ' + element.branch, subName:element.subName?'('+element.subName+')':'',
          distance:distance, idx:idx+this.pageStart,
          phone:phone, category:element.category.middleName + " > " + element.category.subName,
          address:element.address.siDo + " " + element.address.siGunGu + " " + element.address.street + " " + element.address.streetNumber, point:element.point
        });
      })
    },

    themaListClick: function(themaPoi){
      var me = this;
      me.selPoi = null;
      me.seThemalPoi = themaPoi;
      _eventBus.$emit('mapMoveByThema', themaPoi);
    },

    themaMarkerClick: function(themaPoiId){
      var me = this;
      me.listResultSelect = 'thema';
      var appendTop = 0;
      if(me.themaMarkerClickTimer){
        clearInterval(me.themaMarkerClickTimer);
      }
      me.themaMarkerClickTimer = setInterval(function() {
        clearInterval(me.themaMarkerClickTimer);
          me.themaPois.forEach((poi, idx) => {
          if(poi.id == themaPoiId){
            me.seThemalPoi = poi;
            me.$refs.poiResultArea.scrollTop = appendTop;
            return;
          }else{
            appendTop += me.$refs[poi.id][0].offsetHeight;
          }
        });
      },500);
    }
  }
}
</script>

<style scoped>
.tab_wOpen1 {position:absolute;top:-22px;left:4px;width:48px;height:22px;z-index:100; border: 1px solid;border-color: #5c5d5d;border-radius: 4px;}
.tab_wOpen2 {position:absolute;top:-22px;left:52px;width:48px;height:22px;z-index:100; border: 1px solid;border-color: #5c5d5d;border-radius: 4px;}
</style>