<template>
  <div class="playMusic">
    <audio
      ref="audio"
      :src="localSrc||netSrc"
      @timeupdate="playIng"
      @play="befoerPlay"
    ></audio>
    <div class="holder">
      <img :src="musicImg" class="imgHolder" />
      <p class="laric" @click="showLyric">词</p>
    </div>
    <div class="control">
      <div class="topControl">
        <div class="changeSong">
          <div class="tabControl" @click="switchSong('prevMusic')">
            <img class="prev" src="../assets/img/prev.svg" />
          </div>
          <div class="tabControl" @click="playMusic" @keydown.space="playMusic">
            <img class="play" :src="src" />
          </div>
          <div class="tabControl" @click="switchSong('nextMusic') ">
            <img class="next" src="../assets/img/next.svg" />
          </div>
        </div>
        <div class="musicName">
          <loop-scroll :content="musicInfo" :exam="false"></loop-scroll>
        </div>
        <div class="playSet">
          <div class="volumeControl">
            <img class="valumeImg" :src="volumeSrc" @click="changeValumeState" />
            <div class="valume">
              <play-progress @changePercent="changeValume" :percent="volumPercent"></play-progress>
            </div>
          </div>
          <div class="playControl" @click="playSort">
            <img class="playImg" :src="playSrc" />
          </div>
        </div>
      </div>
      <div class="progress">
        <play-progress :percent="percent" @changePercent="changeTime"></play-progress>
        <p class="time">{{time.currentTime+"/"+time.duration}}</p>
      </div>
    </div>
  </div>
</template>
<script>
import playProgress from "./playProgress";
import loopScroll from "./loopScroll";
import { handleMusicTinme } from "../utils/utils";
import { getLyric, getComments } from "../netWork/request";
import { message, shuffle } from "../utils/utils";
import playType from "../utils/playType";
export default {
  name: "playMusic",
  components: {
    playProgress,
    loopScroll,
  },
  data() {
    return {
      flag: false,
      typeIndex: 0,
      value: 0,
      audioDom: null,
      timer: null,
      netSrc: "",
      volumPercent: 0,
      isMute:false
    };
  },
  mounted() {
    this.audioDom = this.$refs.audio;
    this.volumPercent=1;
  },
  methods: {
    async befoerPlay() {
      this.$store.commit("setMusicTime", {
        duration: this.audioDom.duration,
      });
      this.flag = true;
      this.$bus.$emit("play");
    },
    playMusic() {
      this.flag = !this.flag;
      if (this.flag) {
        try {
          let netWorkState=this.audioDom.networkState;
          if(netWorkState===3){
            message("error","歌曲加载出错，请重新选择");
          }
          if (this.audioDom.autoplay !== "autoplay") {
            this.audioDom.autoplay = "autoplay";
          }
          this.audioDom.currentTime =
            this.$store.state.musicTime.currentTime || 0;
          this.audioDom.play();
        } catch (err) {
          this.flag = false;
          message("error", "歌曲播放出错");
        }
      } else {
        this.pause();
      }
    },
    playIng() {
      this.$store.commit("setMusicTime", {
        currentTime: this.audioDom.currentTime,
      });
      if (this.audioDom.duration <= this.audioDom.currentTime) {
        this.switchSong("nextMusic");
      }
    },
    playSort() {
      ++this.typeIndex;
    },
    pause() {
      if (this.flag) {
        this.flag = !this.flag;
      }
      this.audioDom.pause();
      this.$bus.$emit("pause");
    },
    switchSong(action) {
      this.flag = false;
      if (this.typeIndex === 1) {
        this.playMusic();
        return;
      }
      let musicIndex = this.musicInfo.index;
      switch (this.typeIndex) {
        case 0:
          musicIndex = playType.ShunXu(this.musicInfo, action);
          break;
        case 2:
          musicIndex = playType.SuiJi(
            this.musicInfo,
            this.musicList.length,
            action,
            this.randomArr
          );
          break;
        default:
          return require("../assets/img/loop.svg");
          break;
      }
      if (musicIndex >= this.musicList.length - 1) {
        musicIndex = 0;
      }
      if (musicIndex < 0) {
        musicIndex = this.musicList.length - 1;
      }
      this.$bus.$emit("switchSong", musicIndex);
      this.$store.commit("setMusicTime", {
        currentTime: 0,
      });
    },
    showLyric() {
      this.$bus.$emit("showLyric", "left");
    },
    changeTime(rate) {
      this.audioDom.currentTime=(this.audioDom.duration * rate).toFixed(2);
      this.$store.commit("setMusicTime", {
        currentTime: Number(this.audioDom.duration) * rate
      });
    },
    changeValume(rate) {
      this.volumPercent = Number(rate);
      this.audioDom.volume = rate;
    },
    changeValumeState(){
      this.isMute=!this.isMute;
      if (this.isMute) {
        this.changeValume(0);
      }else{
        this.changeValume(1);
      }
    }
  },
  computed: {
    src() {
      if (this.flag) {
        return require("../assets/img/play.svg");
      } else {
        return require("../assets/img/pause.svg");
      }
    },
    playSrc() {
      if (this.typeIndex > 2) {
        this.typeIndex = 0;
      }
      switch (this.typeIndex) {
        case 0:
          return require("../assets/img/loop.svg");
          break;
        case 1:
          return require("../assets/img/singleLoop.svg");
          break;
        case 2:
          return require("../assets/img/radom.svg");
          break;
        default:
          break;
      }
    },
    localSrc() {
      if (this.$store.state.musicInfo.path) {
        return "local-resource://" + this.$store.state.musicInfo.path;
      } else {
        return this.$store.state.musicInfo.url;
      }
    },
    musicImg() {
      if (this.$store.state.musicInfo.url) {
        return this.$store.state.musicInfo.picUrl;
      } else {
        return require("../assets/img/CD.svg");
      }
    },
    musicInfo() {
      return this.$store.state.musicInfo;
    },
    randomArr: {
      get: function () {
        if (this.typeIndex === 2) {
          return shuffle(this.$store.state.musicList);
        }
      },
    },
    musicList() {
      if (this.typeIndex === 2) {
        return this.randomArr;
      }
      return this.$store.state.musicList;
    },
    time() {
      return {
        currentTime: handleMusicTinme(this.$store.state.musicTime.currentTime),
        duration: handleMusicTinme(this.$store.state.musicTime.duration),
      };
    },
    percent() {
      let rate =
        this.$store.state.musicTime.currentTime /
        this.$store.state.musicTime.duration;
      rate = parseFloat(rate).toFixed(4);
      if(rate<0) rate=0;
      if(rate>1) rate=1;
      return +rate;
    },
    volumeSrc(){
      if(!this.isMute){
        return require("../assets/img/volume.svg")
      }else{
        return require("../assets/img/mute.svg")
      }
    }
  },
  watch: {
    async musicInfo() {
      if (this.$store.state.musicInfo.hasOwnProperty("id")) {
        let lyric = await getLyric(this.$store.state.musicInfo.id);
        if(lyric.data.code!==200){
            message("error","歌词获取出错");
            return;
          }
        this.$store.commit("addLyricInfo",lyric.data)
        let comments = await getComments(this.musicInfo.id);
        if(comments.data.code!==200){
          message("error","评论论获取出错");
          return;
        }
        this.$store.commit("addMusicComments", comments.data);
      } else {
        this.$store.commit("addLyricInfo", {});
        this.$store.commit("clearComents");
      }
    },
    time() {
      this.$bus.$emit("playing", this.$store.state.musicTime.currentTime);
    },
  },
};
</script>
<style scoped>
.playMusic {
  width: 100%;
  height: 70px;
  position: absolute;
  background-color: #fff;
  bottom: 0;
  display: flex;
  justify-content: flex-start;
}
.playMusic .imgHolder {
  width: 80px;
  height: 100%;
  position: absolute;
}
.playMusic .holder {
  width: 80px;
}
.playMusic .control {
  height: 100%;
  width: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}
.topControl {
  height: 30px;
  padding: 4px 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.changeSong {
  width: 96px;
}
.playSet {
  width: 170px;
}
.changeSong,
.playSet {
  display: flex;
  justify-content: space-between;
}
.progress {
  width: 100%;
  height: 40px;
  padding: calc(calc(40px - 5px) / 2) 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.prev,
.play,
.next {
  width: 18px;
  height: 18px;
}
.tabControl {
  width: 22px;
  height: 22px;
  cursor: pointer;
  padding: 2px;
}
.volumeControl {
  display: flex;
  width: 120px;
  justify-content: space-between;
  cursor: pointer;
}
.valume {
  position: relative;
  cursor: pointer;
  width: 80px;
  height: 4px;
  border-radius: 1.5px;
  margin: auto 0;
}
.volumeStatus {
  position: absolute;
  width: 80px;
  height: 4px;
  border-radius: 1.5px;
}
.playControl,
.playImg {
  width: 22px;
  height: 22px;
  cursor: pointer;
}
.top {
  width: 80%;
  position: absolute;
  height: 4px;
}
.bottom {
  width: 100%;
  position: relative;
  height: 4px;
  cursor: pointer;
}
.bottom:hover .circleImg,
.valume:hover .circleImg {
  width: 12px;
  height: 12px;
  position: absolute;
  top: -4px;
  right: -6px;
  border-radius: 50%;
}
.circleImg {
  width: 4px;
  height: 4px;
  position: absolute;
  right: 0px;
}
.playMusic .musicName {
  width: 200px;
}
.time {
  width: 60px;
  height: 12px;
  font-size: 10px;
  text-align: center;
  margin: 0 0 0 10px;
}
.playMusic .holder {
  position: relative;
}
.playMusic .laric {
  position: absolute;
  width: 100%;
  height: 100%;
  color: #fff;
  font-size: 50px;
  text-align: center;
  background-color: rgb(150, 143, 143);
  cursor: pointer;
  opacity: 0.5;
  visibility: hidden;
}
.playMusic .holder:hover .laric {
  visibility: visible;
}
</style>                                                                                                                                                                                                                      