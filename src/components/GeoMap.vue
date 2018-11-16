<template lang="html">
<div class="wrap_area2">
	<a href="javascript:void(0)" class="btn_present" @click="geolocationCall"><img src="../assets/images/btn_position.png" alt="현재위치"/></a>
</div>	
</template>

<script lang="js">
  export default  {
    name: 'geo-map',
    props: [],
		computed: {},
		mounted() {},
    data() {
      return {
				map:null,
				mapAreaRef: null,
        fullHeight: 0
      }
		},
		created() {
			_eventBus.$on('mapCover', this.mapCoverHandler);
		},
		methods: {
			initMap:function(mapArea){
				var me = this;
				me.mapAreaRef = mapArea
				me.map = new olleh.maps.Map(mapArea.id, {
					zoomControl: false,
					zoomControlOption: {position:'bottom_left', direction:'vertical', bottom:10},
					panControl: false,
					scaleControl: true,
					scaleControlOptions:{left: 7,bottom:5},
					copyrightControl: true,
					copyrightControlOptions:{bottom:9},
					mapTypeControl: false,
					measureControl: false,
					measureControlOptions:{right:15},
          geolocateControl: false,
          trafficControl: false,
          center: new olleh.maps.UTMK(953828.1032726372, 1952440.2230947923),
					zoom:11,
					mapIdleFire:true
				});

        window._map = me.map;
        _map.onEvent('idle', function() {
					if(me.mapIdleFire){
						_eventBus.$emit('mapIdle', null);
					}
					me.mapIdleFire = true;
        });
			},

			mapCoverHandler: function(status){
				this.mapIdleFire = false;
				if(status.wOpenStatus){
					this.mapAreaRef.style.height = "50%";
				}else{
					if(status.resultAreaVisible){
						this.mapAreaRef.style.height = ($(document).height()-99) + "px";
					}else{
						this.mapAreaRef.style.height = "100%";
					}
				}
				window.dispatchEvent(new Event('resize'));
			},

			geolocationCall: function(){
				if (navigator.geolocation) { // GPS를 지원하면
          				navigator.geolocation.getCurrentPosition(
						function(position) {
							var position = new olleh.maps.LatLng(position.coords.latitude, position.coords.longitude);
							_map.panTo(position);
              _map.setZoom(11);
						}, 
						function(error) {
							console.error(error);
						}, 
						{
							enableHighAccuracy: false,
							maximumAge: 0,
							timeout: Infinity
						}
					);
				} else {
						alert('GPS를 지원하지 않습니다');
				}
			}
		}
	}
</script>

<style scoped>
</style>