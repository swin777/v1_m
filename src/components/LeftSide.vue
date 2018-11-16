<template lang="html">
<div id="aside" v-show="visible">
	<div id="panel">
		<h2 class="blind">검색부분</h2>
		<div class="nav_top">
			<h3>kt geo master</h3>
			<button class="btn_close" @click="leftSideHide"></button>
		</div>
		<ul class="nav_lst">
			<li class="on"><a href="#" class="ico_sh01" @click="$emit('movePoi'); leftSideHide()">검색</a></li>
			<li><a href="#" class="ico_sh02" @click="$emit('moveRoute'); leftSideHide()">길찾기</a></li> 
			<li><a href="#" class="ico_sh03">버스 <span class="ico_comming">(coming soon)</span></a></li>
			<li><a href="#" class="ico_sh04">지하철 <span class="ico_comming">(coming soon)</span></a></li>
		</ul>
		<div class="box_snb">
			<p class="txt_blit"> 공지사항</p>
			<p class="txt_blit"> 문의하기</p><Br />
			<p class="txt_blit"> 지도범례</p>
			<p class="txt_blit"> 지도 open API</p>
			<p class="txt_blit"> KT geo master 소개</p>
		</div>
		<div class="btn_snb">
			<a href="#" class="banner_navi">
				<span>당신이 찾는 모든 길 안내</span>
				<strong>one <span>navi</span></strong>
			</a>
			<a href="#" class="banner_google">구글 play 스토어 <span>바로가기</span></a>
			<a href="#" class="banner_apple">애플 앱스토어 <span>바로가기</span></a>
		</div>
	</div>		
</div>
</template>

<script lang="js">
  export default  {
    name: 'left-side',
    props: {
      visible:{type:Boolean, default:true}
    },
    mounted() {},
    data() {
      return {
      }
    },
    methods: {
      leftSideHide: function(){
        this.$emit('leftSideHide');
      }
    },
    computed: {

    }
}
</script>

<style scoped>
</style>