<template>
  <div class="timeLine">
    <div class="timeLine_control" @click="togglePlay" :class="palyState"></div>
    <div class="timeLine_content">
      <div class="timeLine_content_progress" @click="handleBarClick">
        <div class="timeLine_content_progress_bar"></div>
        <div
          class="timeLine_content_progress_control"
          @mousedown="handleMousedown"
          @mouseup="handleMouseup"
        ></div>
      </div>
      <div class="timeLine_content_count">
        <span
          v-for="(item,index) in count"
          :key="index"
          class="timeLine_content_count_span"
          :class="'timeLine_content_count_span'+index"
          :style="{'line-height':lineHeight}"
          @click="handlecountClick(index)"
        >{{item}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name:'dragTimeline',
  data() {
    return {
      leftBound: 0, //拖动的左边界
      rightBound: 0, //拖动的又边界
      intervalWidth: 0, //每个刻度之间的间隔
      endx: 0, //鼠标拖动结束位置的left值
      palyState: "play", //标识当前是播放还是暂停状态
      timeLine_content_progress_bar: "", //时间轴进度dom对象
      timeLine_content_progress_control: "", //时间轴拖动的图标的dom对象
      lineHeight: "10px", //时间数字的行高
      index:0, //当前时间数字的下标
      isMouse:false, //标识是点击还是鼠标拖拽
      isAnimation:false //标识当前是否是在轮播
    };
  },
  props:{
    count:{
      type:Array,
      default: function() {
        return [0, 2, 4, 6, 8,10,12,14,16,18,20,22]
      }
    },
    defaultIndex:{
      type:Number,
      default:0
    },
    carouselInterval:{
      type:Number,
      default:1000
    }
  },
  mounted() {
    this.index = this.defaultIndex;
    this.timeLine_content_progress_bar = document.getElementsByClassName("timeLine_content_progress_bar")[0]
    this.timeLine_content_progress_control = document.getElementsByClassName("timeLine_content_progress_control")[0]
    this.leftBound = document.getElementsByClassName("timeLine_content")[0].getBoundingClientRect().left
    this.rightBound = document.getElementsByClassName("timeLine_content_progress")[0].getBoundingClientRect().width+this.leftBound - this.timeLine_content_progress_control.getBoundingClientRect().width/2
    this.intervalWidth =document.getElementsByClassName("timeLine_content_progress")[0].getBoundingClientRect().width /(this.count.length - 1);
    this.lineHeight =document.getElementsByClassName("timeLine_content_count_span")[0].getBoundingClientRect().height + "px";
    this.initStyle(this.count.length);
  },
  methods: {
    initStyle(length) {
      // 设置数字的初始位置
      for (let i = 0; i < length; i++) {
        if(i != 0){
          document.getElementsByClassName("timeLine_content_count_span" + i)[0].style.left =this.intervalWidth * i +document.getElementsByClassName("timeLine_content_progress")[0].offsetLeft -5 +"px";
        }else{
           document.getElementsByClassName("timeLine_content_count_span" + i)[0].style.left =this.intervalWidth * i +document.getElementsByClassName("timeLine_content_progress")[0].offsetLeft +"px";
        }
        
      }
      // 设置进度条初始宽度
      this.timeLine_content_progress_bar.style.width =this.defaultIndex * this.intervalWidth + "px";
      // 设置拖拽按钮初始位置
      this.timeLine_content_progress_control.style.left =this.defaultIndex * this.intervalWidth -this.timeLine_content_progress_control.getBoundingClientRect().width / 2 +"px";
    },
    // 拖拽按钮鼠标按下时触发
    handleMousedown(event) {
      this.isMouse = false;
      event = event || window.event;
      event.stopPropagation()
      let _target = event.target;
      // 点击位置距离body可是区域的左边距离
      let startx = event.clientX;
      // 相对于最近的定位祖先元素的左边距离event.target.offsetLeft
      let pregress_left = startx - event.target.offsetLeft; 
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      // 如果是在轮播中，则不能拖动
      if(this.isAnimation){
        return 
      }
      document.onmousemove = ev => {
        this.isMouse = true;
        let event = ev || window.event;
        // 判断水平滚动区域是否在进度条里面
        if (event.clientX < this.leftBound || event.clientX > this.rightBound) {
          return false;
        }
        // 拖拽按钮应该移动的位置
        this.endx = event.clientX - this.leftBound;
        _target.style.left = this.endx + "px";
        this.timeLine_content_progress_bar.style.width = this.endx + "px";
      };
      document.onmouseup = e => {
          this.index = Math.round(this.endx / this.intervalWidth);
          this.timeLine_content_progress_bar.style.width = this.index * this.intervalWidth + "px";
          _target.style.left =this.index * this.intervalWidth - this.timeLine_content_progress_control.getBoundingClientRect().width / 2 +"px";
          document.onmousemove = null;
          this.$emit('timeLineChange',this.index)
          // 防止拖动过后点击document触发mouseup事件
          document.onmouseup = null
        }
      
    },
    // 鼠标松开后取消拖动
    handleMouseup(e) {
      document.onmousemove = null;
    },
    togglePlay() {
      if (this.palyState == "play") {
        this.isAnimation = true
        this.playInterval = setInterval(() => {
           this.index++
          if (this.index >= this.count.length) {
            this.index = 0;
          } 
          this.timeLine_content_progress_bar.style.width =this.index * this.intervalWidth + "px";
          this.timeLine_content_progress_control.style.left =this.index * this.intervalWidth -this.timeLine_content_progress_control.offsetWidth / 2 +"px";
          this.$emit('timeLineChange',this.index)
         
       }, this.carouselInterval);
        this.palyState = "stop";
      } else if (this.palyState == "stop") {
        this.isAnimation = false
        window.clearInterval(this.playInterval);
        this.palyState = "play";
      }
    },
    //进度条点击
    handleBarClick(e) {
        if(!this.isMouse && !this.isAnimation){
          let event = e || window.event;
          this.index = Math.round((event.offsetX ) / this.intervalWidth);
          this.timeLine_content_progress_bar.style.width =this.index * this.intervalWidth + "px";
          this.timeLine_content_progress_control.style.left =this.index * this.intervalWidth -this.timeLine_content_progress_control.getBoundingClientRect().width / 2 +"px";
          this.$emit('timeLineChange',this.index)
        }else{
          this.isMouse = false
        } 
      
    },
    //点击数字
    handlecountClick(clickIndex){
      if(!this.isMouse && !this.isAnimation){
         this.index = clickIndex;
        this.timeLine_content_progress_bar.style.width =this.index * this.intervalWidth + "px";
        this.timeLine_content_progress_control.style.left =this.index * this.intervalWidth -this.timeLine_content_progress_control.getBoundingClientRect().width / 2 +"px";
         this.$emit('timeLineChange',this.index)
      }
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}
.timeLine {
  position: absolute;
  height: 60px;
  width: 80%;
  display: flex;
  background: #eee;
  padding: 0.3rem 1rem;
 left:40px;
 top:100px;
}
.timeLine .timeLine_control {
  height: 2.1rem;
  width: 2.1rem;
  margin-right: 0.8rem;
}
.timeLine .timeLine_control.play {
  background: url(./../assets/images/play.png) no-repeat center center;
  background-size: 100% 100%;
}
.timeLine .timeLine_control.stop {
  background: url(./../assets/images/stop.png) no-repeat center center;
  background-size: 100% 100%;
}
.timeLine .timeLine_content {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.timeLine .timeLine_content .timeLine_content_progress {
  position: relative;
  height: 1.5rem;
  background: #a7aaa887;
  margin-bottom: 0.1rem;
  border-radius: 1rem;
  width: 98%;
  margin: 0 auto;
  margin: 0.3rem 0;
}
.timeLine
  .timeLine_content
  .timeLine_content_progress
  .timeLine_content_progress_bar {
  height: 100%;
  background: skyblue;
  border-radius: 1rem;
}
.timeLine
  .timeLine_content
  .timeLine_content_progress
  .timeLine_content_progress_control {
  position: absolute;
  left: 29%;
  top: 0;
  height: 100%;
  width: 1.5rem;
  background: #ff3b00;
  border-radius: 50%;
  cursor: move;
}
.timeLine .timeLine_content .timeLine_content_count {
  width: 100%;
  flex: 1;
  position: relative;
  overflow: hidden;
}
.timeLine
  .timeLine_content
  .timeLine_content_count
  .timeLine_content_count_span {
  height: 100%;
  position: absolute;
}
</style>