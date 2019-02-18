<template lang="html">
<div class="layer_search02"  id="wrap_searchC" ref="resultArea" v-show="visible" v-bind:style="{top:wOpenStatus?'50%':(fullHeight-99)+'px'}">
  <div class="txt_nav ac">
    <a href="javascript:void(0)" :class="{on:priority==3}" @click="setPriority(3)">최적</a>
    <a href="javascript:void(0)" :class="{on:priority==0}" @click="setPriority(0)">최단</a>
    <a href="javascript:void(0)" :class="{on:priority==2}" @click="setPriority(2)">무료</a>
    <a href="javascript:void(0)" :class="{on:priority==1}" @click="setPriority(1)">고속도로</a>
    <a href="javascript:void(0)" :class="{on:priority==6}" @click="setPriority(6)">실시간 OFF</a>
  </div>
  <div class="box_sky">
    <strong v-show="priority!=6">실시간 교통 정보 데이터를 반영한 결과입니다.</strong>
    <div class="body_sky">
      <ul>
        <li><span>총거리     </span><strong>{{totalLegth}}</strong></li>
        <li><span>소요시간</span><strong>{{totalTime}}</strong></li>
      </ul>
      <button @click="allBound">전체 경로</button>
    </div>
  </div>
  <ol class="list_road">
    <li v-for="route in routes" :ref="'route_'+route.idx" :style="{background:selRoute&&selRoute.idx==route.idx?'#adf1ad':''}" @click="listClick(route)">
      <span class="tit_road" v-if="route.type!=999 && route.type!=1000 && route.type!=1001">
        <img :src="'./staticImage/src/assets/images/turnByturn/' + route.turnByturnImg">
      </span> 
      <p class="txt_road" v-if="route.type!=999 && route.type!=1000 && route.type!=1001"><span>{{route.idx}}</span> {{route.ment}}</p> 
      <strong v-if="route.type==999" class="txt_start">{{route.ment}}</strong>
      <strong v-if="route.type==1000" class="txt_via">{{route.ment}}</strong>
      <strong v-if="route.type==1001" class="txt_stop">{{route.ment}}</strong>
    </li>
  </ol>
</div>
</template>

<script lang="js">
  export default  {
    name: 'route-path',
    computed: {},

    props: {
      visible:{type:Boolean, default:false},
      wOpenStatus:{type:Boolean, default:true},
      startKeyWord: {type:Object},
      endKeyWord: {type:Object},
      viaKeyWordArr:{type:Object},
    },

    watch: {
      visible: function(val){
        if(!val){
          this.mapClear();
        }
      }
    },

    mounted() {
      this.fullHeight = window.innerHeight;
    },

    data() {
      return {
        fullHeight: 0,
        routes: [],
        priority: 3, //0:최단거리 1:고속도로 2:무료도로, 3:최적경로 6:실시간교통
        totalLegth: '',
        totalTime: '',
        executeMode: false,
        searchResult: null,
        markerArr: [],
        polyineArr: [],
        selRoute: null
      }
    },

    methods: {
      setPriority: function(val){
        this.priority = val;
        if(this.startKeyWord && this.startKeyWord.point && this.endKeyWord && this.endKeyWord.point){
          this.rpCall();
        }
      },

      rpCall: function(){
        var me = this;
        me.selRoute = null;
        if(me.executeMode){
            alert("길찾기 중입니다.");
            return;
        }
        var param = me.makeSendParam();
        me.executeMode = true;
        _eventBus.$emit('executeStart', {message:'길찾기'});
        $.ajax({
          url: _app.geomasterUrl+"/lbs/rp?1=1"+param,
          type: "GET",
          contentType: "application/json",
          dataType: "json",
          success: function(result) {
              me.searchResult = result;
              me.totalLegth = me.distFormat(me.searchResult.ROUTE.total_dist);
              me.totalTime = me.timeFormat(me.searchResult.ROUTE.total_time);
              me.listDisplay();
              me.mapDisplay();
              me.executeMode = false;
              _eventBus.$emit('executeEnd', {message:'길찾기'});
          },
          error: function(err){
            _eventBus.$emit('executeEnd', {message:'길찾기'});
            alert("길찾기 실패하였습니다.");
            me.executeMode = false;
          }
        });
      },

      makeSendParam: function(){
        var me = this;
        var param = "&sx=" + me.startKeyWord.point.x + "&sy=" + me.startKeyWord.point.y +
                    "&ex=" + me.endKeyWord.point.x + "&ey=" + me.endKeyWord.point.y + "&priority=" + me.priority;
        for(var i=0; i<3; i++){
          if(this.viaKeyWordArr[i] && this.viaKeyWordArr[i].point){
            var order = i + 1;
            param += "&vx"+order+"=" + this.viaKeyWordArr[i].point.x + "&vy"+order+"=" + this.viaKeyWordArr[i].point.y;
          }
        }
        return param;
      },

      listDisplay: function(){
        var me = this;
        me.routes = [];
        var viaCnt = 0;
        var rg = me.searchResult.ROUTE.rg;
        rg.forEach((rgEle, idx) => {
            var obj = null;
            if(rgEle.type==999){
               me.routes.push({type:999, ment:me.startKeyWord.name, idx:idx});
            }else if(rgEle.type==1000){
              var viaKeyWord = me.viaKeyWordArr[viaCnt];
              me.routes.push({type:1000, ment:viaKeyWord.name, idx:idx});
              viaCnt++;
            }else if(rgEle.type==1001){
              me.routes.push({type:1001, ment:me.endKeyWord.name, idx:idx});
            }else{
              var mAndI = me.mentAndImage(rgEle);
              me.routes.push({type:rgEle.type, ment:mAndI.ment, turnByturnImg:mAndI.turnByturnImg, idx:idx});   
            }
        });
      },

      mapDisplay: function(){
        var me = this;
        me.mapClear();
        var DATA = me.searchResult.DATA;
        var link = me.searchResult.DATA.link;
        var rg = me.searchResult.ROUTE.rg;
        me.allBound();
        var viaCnt = 0;

        //link path그리기
        link.forEach((linkEle, idx) => {
            var utmkArr = [];
            linkEle.vertex.forEach((vertexEle) => {
                utmkArr.push(new olleh.maps.UTMK(vertexEle.x, vertexEle.y))
            });
            var path = new olleh.maps.Path(utmkArr);
            var polyline = new olleh.maps.vector.Polyline({
                map: _map,
                path: path,
                strokeColor: 'blue',
                strokeWeight: 5
            });
            me.polyineArr.push(polyline);
        });

        //Route
        rg.forEach((rgEle, idx) => {
          if(rgEle.type==999){ //출발지
            var startMarker = new olleh.maps.overlay.Marker({
              position: me.startKeyWord.point,
              icon:{url:'./staticImage/src/assets/images/turnByturn/img_start.png', size: new olleh.maps.Size(45, 45)},
              map: _map
            });
            startMarker.ment = "출발지: " + me.startKeyWord.name;
            startMarker.imgUrl = './staticImage/src/assets/images/turnByturn/img_start.png';
            startMarker.turnByturnImg = './staticImage/src/assets/images/turnByturn/img_start.png';
            startMarker.idx = idx;
            startMarker.turnByturnImgVisible = 'none';
            startMarker.onEvent('click', function(e) {
              me.listSelect(startMarker.idx);
            });
            me.markerArr.push(startMarker);
          }else if(rgEle.type==1000){ //경유지
            var viaKeyWord = me.viaKeyWordArr[viaCnt];
            var viaMarker = new olleh.maps.overlay.Marker({
              position: viaKeyWord.point,
              icon:{url:'./staticImage/src/assets/images/turnByturn/img_via.png', size: new olleh.maps.Size(45, 45)},
              map: _map
            });
            viaMarker.ment = "경유지: " + viaKeyWord.name;
            viaMarker.imgUrl = './staticImage/src/assets/images/turnByturn/img_via.png';
            viaMarker.turnByturnImg = './staticImage/src/assets/images/turnByturn/img_via.png';
            viaMarker.idx = idx;
            viaMarker.turnByturnImgVisible = 'none';
            viaMarker.onEvent('click', function(e) {
              me.listSelect(viaMarker.idx);
            });
            me.markerArr.push(viaMarker);
            viaCnt++;
          }else if(rgEle.type==1001){ //도착지
            var endMarker = new olleh.maps.overlay.Marker({
              position: me.endKeyWord.point,
              icon:{url:'./staticImage/src/assets/images/turnByturn/img_stop.png', size: new olleh.maps.Size(45, 45)},
              map: _map
            });
            endMarker.ment = "도착지: " + me.endKeyWord.name;
            endMarker.imgUrl = './staticImage/src/assets/images/turnByturn/img_stop.png';
            endMarker.turnByturnImg = './staticImage/src/assets/images/turnByturn/img_stop.png';
            endMarker.idx = idx;
            endMarker.turnByturnImgVisible = 'none';
            endMarker.onEvent('click', function(e) {
              me.listSelect(endMarker.idx);
            });
            me.markerArr.push(endMarker);
          }else{
            var utmk = new olleh.maps.UTMK(rgEle.x, rgEle.y)
            var marker = new olleh.maps.overlay.Marker({
              position: utmk,
              icon:{
                url:'./staticImage/src/assets/images/marker_num_'+idx+'.png', 
                size: new olleh.maps.Size(19, 19),
                anchor: new olleh.maps.Point(19/2, 19/2)
              },
              map: _map
            });
            marker.idx = idx;
            marker.rg = rgEle;
            var mAndI = me.mentAndImage(rgEle);
            marker.ment = mAndI.ment;
            marker.turnByturnImg = mAndI.turnByturnImg;
            marker.imgUrl = './staticImage/src/assets/images/marker_num_'+idx+'.png';
            marker.turnByturnImgVisible = 'block';
            marker.idx = idx;
            marker.onEvent('click', function(e) {
              me.listSelect(marker.idx);
            });
            me.markerArr.push(marker);
          }
        });
      },

      allBound: function(){
        var me = this;
        var DATA = me.searchResult.DATA;
        var bound = new olleh.maps.Bounds(new olleh.maps.UTMK(DATA.mbr_minx, DATA.mbr_miny), new olleh.maps.UTMK(DATA.mbr_maxx, DATA.mbr_maxy));
        _map.fitBounds(bound);
      },

      listClick: function(route){
        var me = this;
        me.selRoute = route;
        if(me.boundTimer){
          clearInterval(me.boundTimer);
        }
        if(_map.getZoom()<11){
          _map.setZoom(11);
        }
        me.markerArr.forEach((marker, idx) => {
          marker.setZIndex(841683);
          if(marker.idx == route.idx){
            marker.setZIndex(olleh.maps.overlay.BaseOverlay.MAX_ZINDEX);
            me.boundTimer = setInterval(function() {
              clearInterval(me.boundTimer);
              var position = marker.getPosition();
              _map.setCenter(position);
            },500);
          }
        });
      },

      listSelect: function(routeIdx){
        var me = this;
        var appendTop = 0;
        me.routes.forEach((route, idx) => {
          if(route.idx == routeIdx){
            me.selRoute = route;
            me.$refs.resultArea.scrollTop = appendTop;
            return;
          }else{
            appendTop += me.$refs['route_'+route.idx][0].offsetHeight;
          }
        });
      },

      mapClear: function(){
        var me = this;
        me.markerArr.forEach((marker, idx) => {
            marker.setMap(null);
        });
        me.polyineArr.forEach((polyline, idx) => {
            polyline.setMap(null);
        });
        me.markerArr = [];
        me.polyineArr = [];
      },

      markerVisible: function(val){
        var me = this;
        me.markerArr.forEach((marker, idx) => {
            marker.setMap(this.visible&&val?_map:null);
        });
        me.polyineArr.forEach((polyline, idx) => {
            polyline.setMap(this.visible&&val?_map:null);
        });
      },

      distFormat: function(val){
        if(val<1000){
          return val + "m";
        }else{
          return parseFloat(val/1000).toFixed(2) + "km";
        }
      },

      getLatLngPath: function() {
        var me  = this;
        var LatLngPath = [];
        me.searchResult.DATA.link.forEach((link, i) => {
          link.vertex.forEach((vertex, j) => {
            var latlng = new olleh.maps.LatLng.valueOf(new olleh.maps.UTMK(vertex));
            LatLngPath.push({lat: latlng.y, lng: latlng.x});
          });
        });
        return LatLngPath;
      },

      timeFormat: function(val){
        if(val<61){
          return "약 " + Math.round(val) + "분";
        }else{
          var hour = Math.floor(val/60);
          var min = Math.round((val/60 - hour)*60);
          return "약 " + hour + "시간 " + min + "분";
        }
      },

      mentAndImage: function(rgd){
        var ment = '';
        var turnByturnImg ='icon_road_' + rgd.type + '_' + rgd.tspdinfo + '.png';

        if((rgd.dir_name).length > 0){
          ment += (rgd.dir_name + ' 방면 ');
        }
       
        switch(rgd.type){
          case 0: ment += '안내없음'; break;
          case 1: ment += '직진'; break;
          case 2: ment += '1시 방향 우회전'; break;
          case 3: ment += '2시 방향 우회전'; break;
          case 4: ment += '우회전'; break;
          case 5: ment += '4시 방향 우회전'; break;
          case 6: ment += '5시 방향 우회전'; break;
          case 7: ment += '7시 방향 좌회전'; break;
          case 8: ment += '8시 방향 좌회전'; break;
          case 9: ment +=  '좌회전'; break;
          case 10: ment += '10시 방향 좌회전'; break;
          case 11: ment += '11시 방향 좌회전'; break;
          case 12: ment += '직전 방향에 고가도로 진입'
          case 13: ment += '오른쪽 방향에 고가도로 진입'; break;
          case 14: ment += '왼쪽 방향에 고가도로 진입'; break;
          case 15: ment += '지하차도 진입'; break;
          case 16: ment += '오른쪽 방향에 고가도로 옆 도로 진입'; break;
          case 17: ment += '왼쪽 방향에 고가도로 옆 도로 진입'; break;
          case 18: ment += '오른쪽 방향에 지하차도 옆도로 진입'; break;
          case 19: ment += '왼쪽방향에 지하타도 옆도로 진입'; break;
          case 20: ment += '오른쪽 도로 진입'; break;
          case 21: ment += '왼쪽 도로 진입'; break;
          case 22: ment += '직진 방향에 고속도로 진입'; break;
          case 23: ment += '오른쪽 방향에 고속도로 진입'; break;
          case 24: ment += '왼쪽 방향에 고속도로 진입'; break;
          case 25: ment += '직진 방향에 도시고속도로 진입'; break;
          case 26: ment += '오른쪽 방향에 도시고속도로 진입'; break;
          case 27: ment += '왼쪽 방향에 도시고속도로 진입'; break;
          case 28: ment += '오른쪽 방향에 고속도로 출구'; break;
          case 29: ment += '왼쪽 방향에 고속도로 출구'; break;
          case 30: ment += '오른쪽 방향에 도시고속도로 출구'; break;
          case 31: ment += '왼쪽 방향에 도시고속도로 출구'; break;
          case 32: ment += '분기점에서 직진'; break;
          case 33: ment += '분기점에서 오른쪽'; break;
          case 34: ment += '분기점에서 왼쪽'; break;
          case 35: ment += 'U-turn'; break;
          case 36: ment += '무발성 직진'; break;
          case 37: ment += '터널'; break;
          case 38: ment += '없음'; break;
          case 39: ment += '없음'; break;
          case 40: ment += '로터리에서 1시 방향'; break;
          case 41: ment += '로터리에서 2시 방향'; break;
          case 42: ment += '로터리에서 3시 방향'; break;
          case 43: ment += '로터리에서 4시 방향'; break;
          case 44: ment += '로터리에서 5시 방향'; break;
          case 45: ment += '로터리에서 6시 방향'; break;
          case 46: ment += '로터리에서 7시 방향'; break;
          case 47: ment += '로터리에서 8시 방향'; break;
          case 48: ment += '로터리에서 9시 방향'; break;
          case 49: ment += '로터리에서 10시 방향'; break;
          case 50: ment += '로터리에서 11시 방향'; break;
          case 51: ment += '로터리에서 12시 방향'; break;
          case 999: return '출발지';
          case 1000: return '경유지';
          case 1001: return '목적지';
          default : ment = ''; break;
        }
        var dist = rgd.nextdist;
        if(dist > 0){
          if(dist >= 1000){
            dist = (((dist / 1000) | 0) +'k');
          }
          if(ment.length > 0 ){
            ment += ' 후 ';
          }
          ment += (dist + 'm 이동');
        }
        return {"ment":ment, "turnByturnImg":turnByturnImg};
      }
    }
}
</script>

<style scoped >
</style>