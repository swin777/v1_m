<template lang="html">
<div class="geo_box" v-show="visible"> 
  <div class="wrap_Gsearch02" id="geo_box02">
    <!--출발지 시작-->
    <div v-show="searchBar">
      <button class="btn_prev" @click="movePoiClick">길찾기 화면 변경</button>
      <span class="seach_inp">
        <input type="text" title="출발지가 어디신가요?" placeholder="출발지가 어디신가요?" class="input_act02" v-model="startKeyWord.name" 
            @focus="keyWordFocus($refs.startAutoComplate)" @focusout="keyWordFocusOut($refs.startAutoComplate)" @input="typing($event, 'startKeyWord')"/>
        <span class="btn_search" id="searchBox" @click="poiSearchClick">검색</span>
      </span>
      <button class="btn_gclose" id="searchBox" @click="keyWordClear(startKeyWord)">삭제</button>
    </div>
    <auto-complate :keyWord="startKeyWord.name" @keyWordSelect="keyWordSelectHandler($event, 'startKeyWord')" ref="startAutoComplate"></auto-complate>
    <!--출발지 끝-->
    <!--경유지 시작-->
    <div class="wrap_inpAdd" v-for="via in viaArr" v-show="searchBar">
      <button class="btn_via2" id="searchBox"  @click="viaAdd">경유추가</button>
      <span class="seach_inp">
        <input type="text" title="경유지가 어디신가요?" placeholder="경유지가 어디신가요?" class="input_act03" v-model="viaKeyWordArr[via].name" 
            @focus="keyWordFocus($refs['viaAutoComplate'+via][0])" @focusout="keyWordFocusOut($refs['viaAutoComplate'+via][0])" @input="typing($event, viaKeyWordArr, via)"/>
        <span class="btn_search" id="searchBox" @click="poiSearchClick">검색</span>
      </span>
      <button class="btn_gclose" id="searchBox" @click="viaRemove(via)">삭제</button>
    </div>
    <auto-complate v-for="via in viaArr" :key="via" :keyWord="viaKeyWordArr[via].name" @keyWordSelect="keyWordSelectHandler($event, viaKeyWordArr, via)" :ref="'viaAutoComplate'+via" :top="via*40+80"></auto-complate>
    <!--경유지 끝-->
    <!--도착지 시작-->
    <div class="wrap_inpAdd" v-show="searchBar">
      <button class="btn_via2" id="searchBox" @click="viaAdd">경유추가</button>
      <span class="seach_inp">
        <input type="text" title="도착지가 어디신가요?" placeholder="도착지가 어디신가요?" class="input_act03" v-model="endKeyWord.name" 
            @focus="keyWordFocus($refs.endAutoComplate)" @focusout="keyWordFocusOut($refs.endAutoComplate)" @input="typing($event, 'endKeyWord')"/>
        <span class="btn_search" id="searchBox" @click="poiSearchClick">검색</span>
      </span>
      <button class="btn_gclose" id="searchBox" @click="keyWordClear(endKeyWord)">삭제</button>
    </div>
    <auto-complate :keyWord="endKeyWord.name" @keyWordSelect="keyWordSelectHandler($event, 'endKeyWord')" ref="endAutoComplate" :top="viaArr.length*40+80"></auto-complate>
    <!--도착지 끝-->
    <!--버튼영역 시작-->
    <div class="btnBar">
      <button class="btn_exchange" @click="exchange">출,도착 변경</button>
      <button class="routeBtn" @click="routePathSearch">길찾기</button>
      <img :src="searchBar?'./staticImage/src/assets/images/bt_up.gif':'./staticImage/src/assets/images/bt_down.gif'" style="position: absolute;top: 6px;left: 4px;" @click="searchBar=!searchBar">
    </div>
    <!--버튼영역 끝-->
  </div>
  <!-- 출발지, 경유지, 도착지에 POI검색결과 시작-->
  <div class="layer_search"  id="wrap_searchB" v-show="resultAreaVisible" style="height: 99px; bottom: 0px;" v-bind:style="{top:wOpenStatus?'50%':'auto'}">
    <button class="btn_wOpen" v-show="wOpenStatus" @click="wsToggle">클릭버튼</button>
    <button class="btn_wClose" v-show="!wOpenStatus" @click="wsToggle">닫기버튼</button>
    <div id="height_serC" ref="poiResultArea" v-bind:style="{position:wOpenStatus?'fixed':'relative', display:wOpenStatus?'block':selPoi?'none':'block'}">
      <swiper ref="mySwiper" @slideNextTransitionEnd="slideNextTransitionEnd" @slidePrevTransitionEnd="slidePrevTransitionEnd">
        <swiper-slide v-for="slide in slides" :key="slide.id">
          <ul class="list_serC">
            <li v-for="poi in pois[slide]" style="min-height:99px;" v-bind:style="{background:selPoi&&selPoi.id==poi.id?'#adf1ad':''}" :ref="poi.id">
              <div :id="poi.id" :idx="poi.idx" @click="listClick(poi)">
                <span class="wrap_serC"><strong class="tit_serC">{{poi.name + poi.branch + poi.subName}}</strong> <span class="fr">{{poi.category}}</span></span>
                <p><span>{{poi.distance}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{poi.phone}}</a></span></p>
                <p>{{poi.address}}</p>
              </div> 
              <span class="tranbtn"><button class="btn_road02" @click="directKeyWordSelect(poi)">길찾기 전환</button></span>
            </li>
          </ul>
        </swiper-slide>
        <swiper-slide><div class="outer"><div class="inner"><div class="centered">조회중...</div></div></div></swiper-slide>
      </swiper>
    </div>
    <div id="height_serC2" ref="poiResultArea2" style="position:absolute;z-index:;width:100%;height:100%;bottom: 0px;" v-bind:style="{display:wOpenStatus?'none':selPoi?'block':'none'}">
      <ul class="list_serC">
        <li style="background:#adf1ad">
          <div @click="listClick(selPoi)">
            <span class="wrap_serC"><strong class="tit_serC">{{selPoi?selPoi.name + selPoi.branch + selPoi.subName:''}}</strong> <span class="fr">{{selPoi?selPoi.category:''}}</span></span>
            <p><span>{{selPoi?selPoi.distance:''}}</span> <span class="txt_phone"><a href="javascript:void(0)">{{selPoi?selPoi.phone:''}}</a></span></p>
            <p>{{selPoi?selPoi.address:''}}</p>
          </div> 
          <span class="tranbtn"><button class="btn_road02" @click="directKeyWordSelect(selPoi)">길찾기 전환</button></span>
        </li>
      </ul>
    </div>
  </div>
  <!-- 출발지, 경유지, 도착지에 POI검색결과 끝-->
  <route-path :visible="routePathVisible" :wOpenStatus="wOpenStatus" :startKeyWord=startKeyWord :endKeyWord=endKeyWord :viaKeyWordArr=viaKeyWordArr ref="routePath"></route-path>
</div>
</template>

<script lang="js">
import AutoComplate from '@/components/util/AutoComplate';
import { swiper, swiperSlide } from 'vue-awesome-swiper';
import RoutePath from '@/components/RoutePath';
import 'swiper/dist/css/swiper.css';

export default  {
  name: 'route-search',
  components:{AutoComplate, swiper, swiperSlide, RoutePath},
  props: {
    visible:{type:Boolean, default:false}
  },
  mounted() {},
  computed: {},

  data() {
    return {
      currKeyWord:null,
      startKeyWord: {name:'', point:null},
      endKeyWord: {name:'', point:null},
      viaKeyWordArr:{0:{name:'', point:null}, 1:{name:'', point:null}, 2:{name:'', point:null}},
      viaArr: [],
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
      bound: null,
      routePathVisible: false,
      searchBar: true
    }
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
      this.$refs.routePath.markerVisible(val);
    }
  },

  methods: {
    movePoiClick: function(){
      this.bound = _map.getBounds();
      this.$emit('movePoi');
    },

    poiSearchClick: function(){
      this.searchCall();
    },

    keyWordFocus: function(autoComplate){
      autoComplate.autoComplateHandler();
    },

    keyWordFocusOut: function(autoComplate){
      autoComplate.autoComplatEnd();
    },

    keyWordSelectHandler: function(terms, refer, idx){
      if(typeof refer == 'string'){
        this[refer].name = terms;
        this.currKeyWord = this[refer];
      }else{
        refer[idx].name = terms; 
        this.currKeyWord = refer[idx];
      }
      this.searchCall();
    },

    directKeyWordSelect: function(poi){
      if(poi){
        if(!this.currKeyWord){
          this.currKeyWord = this.startKeyWord;
        }
        this.currKeyWord.name = poi.name;
        this.currKeyWord.point = olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(poi.point.lat, poi.point.lng));
      }
    },

    typing: function(e, refer, idx){
      if(typeof refer == 'string'){
        this[refer].name = e.target.value;
        this.currKeyWord = this[refer];
      }else{
        refer[idx].name = e.target.value; 
        this.currKeyWord = refer[idx];
      }
    },

    viaAdd: function(){
      if(this.viaArr.length==3){
        alert("경유지는 3까지입니다.");
        return;
      }
      this.viaArr.push(this.viaArr.length);
    },

    viaRemove: function(via){
      for(var i=via; i<3; i++){
        if(i==2){
          this.viaKeyWordArr[i].name = '';
          this.viaKeyWordArr[i].point = null;
        }else{
          this.viaKeyWordArr[i] = this.viaKeyWordArr[i+1];
        }
      }
      var newLen = this.viaArr.length-1;
      this.viaArr = [];
      for(var i=0; i<newLen; i++){
        this.viaArr.push(i);
      }
    },

    keyWordClear: function(keyWord){
      keyWord.name = '';
      keyWord.point = null;
    },

    exchange: function(){
      var tmp = this.startKeyWord;
      this.startKeyWord = this.endKeyWord;
      this.endKeyWord = tmp;
    },

    routePathSearch: function(){
      if(this.startKeyWord && this.startKeyWord.point && this.endKeyWord && this.endKeyWord.point){
        this.markerClear();
        this.$refs.routePath.rpCall();
        this.routePathVisible = true;
      }
    },

    wsToggle: function(){
      this.wOpenStatus=!this.wOpenStatus;
    },

    searchCall: function(append, prev){
      var me = this;
      me.routePathVisible = false;
      if(!this.currKeyWord){
        return;
      }
      if(!append){
        me.pageStart = 0;
        me.pois = [];
        me.slides = [];
      }
      me.resultAreaVisible = true;
      me.wOpenStatus = true;
      var point = olleh.maps.LatLng.valueOf(_map.getCenter());
      $.ajax({
        url: _app.geomasterUrl+"/search/v1.0/pois?sortBy="+me.sortBy+"&numberOfResults="+me.pageSize+"&start="+me.pageStart+"&mode=NAVIGATION",
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({"terms":me.currKeyWord.name, "point":{"lat":point.y, "lng":point.x}}),
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
          address:element.address.siDo + " " + element.address.siGunGu + " " + element.address.street + " " + element.address.streetNumber, point:element.point, routeOptimization:element.routeOptimization
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
          if(element.routeOptimization && element.routeOptimization.multipleEntrance && element.routeOptimization.multipleEntrance.length>0){
            latLngPoint = new olleh.maps.LatLng(element.routeOptimization.multipleEntrance[0].lat, element.routeOptimization.multipleEntrance[0].lng);
          }
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
          if(idx==0){ //첫번째것으로 출발지 or 경유지 or 도착지 찾은 결과로 넣어준다.
            this.currKeyWord.name = element.name;
            this.currKeyWord.point = point;
          }
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
            me.currKeyWord.name = poi.name;
            me.currKeyWord.point = marker.getPosition();
          },500);
        }
      });
    },

    listSelect: function(poiId){
      var me = this;
      var appendTop = 0;
      me.pois[me.pageStart/10].forEach((poi, idx) => {
        if(poi.id == poiId){
          me.selPoi = poi;
          me.$refs.poiResultArea.scrollTop = appendTop;
          return;
        }else{
          appendTop += me.$refs[poi.id][0].offsetHeight;
        }
      });
    },

    slideNextTransitionEnd: function(){
      this.$refs.poiResultArea.scrollTop = 0
      if(this.pageStart+10 < this.searchResult.numberOfPois){
        this.pageStart += 10;
        if(this.pageStart/10 == this.slides.length){
          this.searchCall(true);
        }else{
          this.mapDisplay();
        }
      }else{
        this.pageStart += 10;
        this.$refs.mySwiper.swiper.slidePrev(null, null)
      }
    },

    slidePrevTransitionEnd: function(){
      this.$refs.poiResultArea.scrollTop = 0
      if(this.pageStart!=0){
        this.pageStart -= 10;
        this.mapDisplay();
      }
    }
  }
}
</script>

<style scoped>
  .btnBar {height:38px;background-color: #fff}
  .routeBtn {height:28px; position:absolute; right:4px;top:5px;width:50px;height:28px; background-color: #60f779; border: 1px solid;border-color: #5c5d5d;border-radius: 4px;}
</style>