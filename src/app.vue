<template>
  <div id="app">
    <div class="section">
      <div class="content">
        <h3>{{ cityList[current].name }}薪资统计图表</h3>
        <div class="chartBox">
          <v-chart class="charts" :options="pie"/>
        </div>
        <h3>{{ cityList[current].name }}薪资统计图表</h3>
        <div class="chartBox">
          <v-chart class="charts" :options="line"/>
        </div>
        <h3>{{ cityList[current].name }}薪资地域分布图表</h3>
        <div class="chartBox">
          <v-chart style="height: 500px" class="charts" :options="scatter"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import changshaData from './assets/datas/changSha-data.json'
import shenZhengData from './assets/datas/shenZheng-data.json'
import shangHaiData from './assets/datas/shangHai-data.json'
import beiJingData from './assets/datas/beiJing-data.json'

import Vue from 'vue'
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/effectScatter'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/axis'
import 'echarts/lib/component/dataZoom'
import 'echarts/extension/bmap/bmap'

export default {
  name: 'Home',
  components: {
    'v-chart': ECharts
  },
  data() {
    const salaryType = ['面议', '1-5k', '5-8k', '8-10k', '10-13k', '13-15k', '15-20k', '20-25k', '25-30k', '30k+']
    return {
      current: 0,
      cityList: [ {name: '长沙', geo: [113, 28.21]},
                  {name: '深圳', geo: [114.07,22.62]},
                  {name: '上海', geo: [121.48,31.22]}, 
                  {name: '北京', geo: [116.46,39.92]}],
      dataList: [changshaData, shenZhengData, shangHaiData, beiJingData],
      salaryType,
    };
  },
  computed: {
    average: function (){
      return this.dataList[this.current].data.map((val, i) => {
        const re = /^[0-9]+.?[0-9]*/
        if (re.test(val[5])&&re.test(val[6])){
         return parseFloat((val[5] + val[6])/2).toFixed(1)
        }else{
          // 面议
          return 0 
        }
      })
    },
    pie: function() {
      const data = Array(10).fill(0).map((val, i) => {
              return { value: val, name: this.salaryType[i] }
            })
      this.average.map((val, i) => {
        if(val<1) data[0].value++
        if(val>=1&&val<5) data[1].value++
        if(val>=5&&val<8) data[2].value++
        if(val>=8&&val<10) data[3].value++
        if(val>=10&&val<13) data[4].value++
        if(val>=13&&val<15) data[5].value++
        if(val>=15&&val<20) data[6].value++
        if(val>=20&&val<25) data[7].value++
        if(val>=25&&val<30) data[8].value++
        if(val>=30) data[9].value++
      })
      return {   
        title : {
          subtext: `总数：${this.dataList[this.current].total}条\n时间：${this.dataList[this.current].date}`,
          x:'center'
        },
        tooltip : {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)"
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.salaryType
        },
        series : [
          {
            name: '访问来源',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data: data,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    },
    line: function () {
      const sortedData = this.dataList[this.current].data.sort(this.sortData(true));
      const lineData = this.average.sort(this.sortData(false));
      return {
        color: ['#61a0a8','#006699'],   
        title : {
          subtext:
           `总数：${this.dataList[this.current].total}条\n时间：${this.dataList[this.current].date}`,
          x:'center'
        },     
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              show: true
            }
          },
          formatter: function (params){
            const i = params[0].dataIndex
            let result =`
              ${sortedData[i][0]} <br />
              ${sortedData[i][1]} <br />
              ${sortedData[i][4]} <br />
            `
            if(sortedData[i][5]){
              result += `${sortedData[i][5]} - ${sortedData[i][6]}K`
            }else{
              result += '面议'
            }
            return result
          }
        },
        toolbox: {
          show : true,
          feature : {
            mark : {show: true},
            magicType: {show: true, type: ['line', 'bar']},
            saveAsImage : {show: true}
          }
        },
        calculable : true,
        legend: {
          itemGap: 5,
          left: '1%'
        },
        grid: {
          top: '12%',
          left: '1%',
          right: '10%',
          containLabel: true
        },
        xAxis: [
          {
            type : 'category',
            data : sortedData.map((val, i) => {
              return val[0]
            })
          }
        ],
        yAxis: [
          {
            type : 'value',
            name : '薪资',
            axisLabel: {

            }
          }
        ],
        dataZoom: [
          {
            show: true,
            start: 90,
            end: 100
          },
          {
            type: 'inside',
            start: 90,
            end: 100
          },
        ],
        series : [
          {
            barGap: 0,
            name: '薪资下限',
            type: 'bar',
            data: sortedData.map(val => val[5]||0)
          },
          {
            name: '薪资上限',
            type: 'bar',
            data: sortedData.map(val => val[6]||0)
          }
        ]
      }
    },
    scatter: function() {
      let dimension = 4;
      const average = this.average;
      const dataCopy = this.dataList[this.current];
      const mapDatas = dataCopy.data.map((val, i) => {
                  return {
                    name: val[0],
                    value: [
                      Number(val[9]),
                      Number(val[8]),
                      val[5]?val[5]:-1,
                      Number(average[i]),
                      val[6]?val[6]:-1,
                    ]
                  }
                })
      return {
        // 加载 bmap 组件
        title: {
            textStyle: {
                color: 'white'
            },
            subtext: `总数：${dataCopy.total}条\n时间：${this.dataList[this.current].date}`,
            x: 'center'
        },
        bmap: {
            center: this.cityList[this.current].geo,
            zoom: 12,
            roam: true,
            mapStyle: {
                styleJson: [{
                        "featureType": "land",
                        "elementType": "all",
                        "stylers": {
                            "color": "#073763"
                        }
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": {
                            "color": "#073763",
                            "lightness": -54
                        }
                    },
                    {
                        'featureType': 'arterial',
                        'elementType': 'geometry.fill',
                        'stylers': {
                            // 'color': '#ffffff',
                            "color": "#073763",
                            // "lightness":-62,
                        }
                    },
                    {
                        'featureType': 'arterial',
                        'elementType': 'geometry.stroke',
                        'stylers': {
                            'color': '#555555'
                        }
                    },
                    {
                        "featureType": "highway",
                        "elementType": "all",
                        "stylers": {
                            "color": "#45818e",
                            'visibility': 'off'
                        }
                    },
                    {
                        'featureType': 'railway',
                        'elementType': 'all',
                        'stylers': {
                            'visibility': 'off'
                        }
                    },
                    {
                        'featureType': 'subway',
                        'elementType': 'geometry',
                        'stylers': {
                            'lightness': -70
                        }
                    },
                    {
                        'featureType': 'building',
                        'elementType': 'geometry.fill',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'building',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#022338'
                        }
                    },
                    {
                        'featureType': 'all',
                        'elementType': 'labels.text.fill',
                        'stylers': {
                            'color': '#857f7f'
                        }
                    },
                    {
                        'featureType': 'all',
                        'elementType': 'labels.text.stroke',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        "featureType": "boundary",
                        "elementType": "all",
                        "stylers": {
                            "color": "#ffffff",
                            "lightness": -62,
                            "visibility": "on"
                        }
                    },
                    {
                        'featureType': 'green',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#062032'
                        }
                    },
                    {
                        'featureType': 'local',
                        'elementType': 'geometry',
                        'stylers': {
                            'color': '#000000'
                        }
                    },
                    {
                        'featureType': 'manmade',
                        'elementType': 'all',
                        'stylers': {
                            'color': '#022338'
                        }
                    },
                    {
                        "featureType": "label",
                        "elementType": "labels.text.fill",
                        "stylers": {
                            "color": "#ffffff",
                            "visibility": "on"
                        }
                    },
                    {
                        "featureType": "label",
                        "elementType": "labels.text.stroke",
                        "stylers": {
                            "color": "#444444",
                            "visibility": "off"
                        }
                    },
                    {
                        "featureType": "medical",
                        "elementType": "all",
                        "stylers": {
                            "visibility": "off"
                        }
                    }
                ]
            }
        },
        visualMap: {
            type: 'piecewise',
            dimension,
            pieces: [
                { max: 0 },
                { min: 1, max: 5 },
                { min: 5, max: 8 },
                { min: 8, max: 10 },
                { min: 10, max: 13 },
                { min: 13, max: 16 },
                { min: 16, max: 20 },
                { min: 20, max: 25 },
                { min: 25, max: 30 },
                { min: 30, max: 40 },
                { min: 40 }
            ],
            calculable: true,
            itemWidth: 36,
            itemHeight: 20,
            left: 10,
            top: 10,
            inverse: true,
            hoverLink: false,
            inRange: {
                color: ['#50a3ba', '#eac736', '#d94e5d', 'darkred']
            },
            outOfRange: {
                symbolSize: 0
            },
            textStyle: {
                color: '#fff'
            },
            formatter(a, b) {
                if (a < 0) return '面议';
                if (b > 40) return '超高薪';
                return `${a} - ${b}K`;
            },
        },
        series: [{
            type: 'scatter',
            coordinateSystem: 'bmap',
            data: mapDatas,
            symbolSize: function(data, params) {
              const i = params.dataIndex
              if (average[i]&&average[i]>=0) {
                return average[i] * 3 / 7 + 8;
              }
            },
            label: {
              emphasis: {
                show: true,
                formatter: function(params) {
                    let data = dataCopy.data[params.dataIndex]
                    return data[0];
                },
                position: 'top',
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white'
              }
            },
            itemStyle: {
                normal: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowOffsetY: 0,
                }
            }
        }],
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            padding: [10, 10, 10, 10],
            backgroundColor: 'rgba(144,152,160,0.7)',
            borderColor: '#ccc',
            borderWidth: 2,
            borderRadius: 4,
            transitionDuration: 0,
            extraCssText: 'width: 258px;',
            textStyle: {
                fontSize: 13
            },
            position: {
                right: 10,
                bottom: 10
            },
            enterable: true,
            hideDelay: 666,
            formatter(params) {
                let data = dataCopy.data[params.dataIndex];
                let template = '';
                const makeTemplate = (key, value) => {
                    template += `<li><span>${key}</span>：${value}</li>`;
                };
                makeTemplate('名称', data[0]);
                makeTemplate('规模', data[1]);
                makeTemplate('职位', data[7]);
                makeTemplate('年限', data[4]);
                makeTemplate('薪资', data[5] ? data[5] + ' - ' + data[6] + 'K' : '面议');
                makeTemplate('市区', data[10] + ' ' + data[11]);
                makeTemplate('发布时间', data[12]);
                makeTemplate('公司链接', `<a target="_blank" href="${data[2]}">${data[2]}</a>`);
                makeTemplate('招聘链接', `<a target="_blank" href="${data[3]}">${data[3]}</a>`);
                template = `<ul class="template">${template}</ul>`;
                return template;
            }
        },
      }
    }
  },
  methods: {
    sortData: function(isObj) {
      return function(A, B) {
        if(isObj){
          let averageA = 0, averageB = 0;
          const re = /^[0-9]+.?[0-9]*/
          if (re.test(A[5])&&re.test(A[6])) averageA = parseFloat((A[5] + A[6])/2).toFixed(1)
          if (re.test(B[5])&&re.test(B[6])) averageB = parseFloat((B[5] + B[6])/2).toFixed(1)
          return averageA - averageB
        }
        return A - B
      }
    }
  },
  beforeCreate() {
    console.log('在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用');
  },
  created() {
    console.log('在实例创建完成后被立即调用');
  },
  beforeMount() {
    console.log('在挂载开始之前被调用');
  },
  mounted() {
    console.log('挂载完成');
  },
  beforeUpdate() {
    console.log('数据更新时调用，发生在虚拟 DOM 重新渲染和打补丁之前');
  },
  updated() {
    console.log('发生在虚拟 DOM 重新渲染和打补丁之后');
    // 当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该避免在此期间更改状态。
    this.$nextTick(function () {
      // 所有的子组件也都一起被挂载可以用 vm.$nextTick
    })
  },
  activated() {
    console.log('keep-alive 组件激活时调用');
  },
  deactivated() {
    console.log('keep-alive 组件停用时调用');
  },
  beforeDestroy() {
    console.log('Vue 实例销毁之前调用');
  },
  destroyed() {
    console.log('Vue 实例销毁后调用');
  },
  errorCaptured(err, vm, info) {
    console.log('当捕获一个来自子孙组件的错误时被调用');
  }
};
</script>

<style>
body{
  padding: 0;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #4285f4;
}
.section{
  padding: 45px 10px;
  background: url(./assets/download.png) repeat;
}
.content{
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 800px;
  padding: 15px;
  background: #fff;
  border: 10px solid #050707;
}
.chartBox{
  width: 100%;
}
.charts{
  width: 100%;
}
.template {
    list-style-type: none;
    padding: 0;
    margin: 0;
}
.template li {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 3px 0;
}
.template span {
    color: #efea85;
}
</style>
