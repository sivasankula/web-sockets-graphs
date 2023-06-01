import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as ApexCharts from 'apexcharts';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, AfterViewInit {

  socket:any = null
  tableRes:any = []
  btnDisabled = false
  chart:any;
  chartScan:any
  chartLiveAmp:any
  chartData:any = []
  isScanStarted:boolean = false
  isScanEnable:boolean = false
  isShowScanImage:boolean = false
  clickedRecord:any
  isClickedAny:boolean = false
  scanTime:any
  randomNumber:any = 2
  constructor() { }


  getApiResponse = () =>{
  

    this.randomNumber = 2
    if(this.chartScan){
    this.chartScan.destroy();
    this.chartScan = null;
    }
    if(this.chartLiveAmp){
      this.chartLiveAmp.destroy()
    this.chartLiveAmp = null;
    }


    this.chartData = []
    this.isScanStarted = true;
    this.isScanEnable = true;
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    this.scanTime = formattedDate;
    function generateHeatmapData(numSeries: number, distance:number): any[] {
      const seriesData: any[] = [];
    
      for (let i = 0; i < 10; i++) {
        const data = [];
        for(let j = 1 ; j<= 1; j++){
          const point = { x: j*5, y:  Math.floor(Math.random() * 101) , heat: Math.floor(Math.random() * 101) };
          data.push(point);
        }
          seriesData.push({
          name: `coil_A${i + 1}`,
          data: data
        });
      }
      console.log('ser',seriesData)
    
      return seriesData;
    }
    this.chartData =  generateHeatmapData(1, 0.9)
    this.chart = new ApexCharts(document.querySelector('#chart'), {
      chart: {
        type: 'heatmap',
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            console.log('--',event,'3--', chartContext,'00', config,'000', this.chartData)
              if(this.chartLiveAmp){
                this.chartLiveAmp.destroy()
              this.chartLiveAmp = null;
              }
              console.log(config.dataPointIndex, config,this.chartData[config.seriesIndex]);
              this.isClickedAny = true;
              this.clickedRecord = config.dataPointIndex;
              // console.log( [{ label: this.chartData[config.seriesIndex].name, value: this.chartData[config.seriesIndex].data[config.dataPointIndex].y}],'ssss')
              this.chartLiveAmp = new ApexCharts(
                document.querySelector('#chart_liveAmp'),
                {
                  series: [
                    {
                      // data:   [{ label: this.chartData[config.seriesIndex].name, value: this.chartData[config.seriesIndex].data[config.dataPointIndex].y}],
                      // data:[ this.chartData[config.seriesIndex].data[config.dataPointIndex].y]
                      data: this.chartData[config.seriesIndex].data.map((k:any)=>k.y)
                    },
                  ],
                  chart: {
                    type: 'line',
                    height: 200,
                    width: 300,
                  },
                  labels: this.chartData[config.seriesIndex].data.map((k:any)=>k.x),
                  stroke: {
                    curve: 'smooth',
                  },
                }
              );

              this.chartLiveAmp.render();
          },
        },
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        heatmap: {
          colorScale: {
            ranges: [
              { from: 0, to: 50, color: '#FFD2D2' }, // Light red for the range 0-50
              { from: 50, to: 100, color: '#FF0000' } // Dark red for the range 50-100
            ]
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: 'numeric'
      },
      series: this.chartData
    
    });
  
    this.chart.render();

    this.btnDisabled = true
    let count = 0

    // example --
    const interval = setInterval(()=>{
      this.updateChartData(1)
    },2000)

    setTimeout(() => {
      clearInterval(interval)
      console.log('---sss')
    }, 10000);
    this.socket.onmessage = (e:any)=>{
      // console.log(e.data)
     if(count%3 === 0)
      this.updateChartData(parseInt(e.data))
      count++
    }
    this.socket.onclose = (e:any)=>{
      this.socket = new WebSocket("ws://localhost:8080");
    }
    console.log('api called')
    this.socket.send('getData')
  }

  updateChartData(newData: number) {
    // Add the new data to the chart data array
    this.chartData = this.chartData.map((item:any)=>{
      console.log(item)
      item.data.push({x: this.randomNumber*5, y: Math.floor(Math.random() * 101), heat:Math.floor(Math.random() * 101)})
      return {...item}
    })
    this.randomNumber = this.randomNumber+1
  
    // Limit the chart data array to a maximum of 10 items
    if (this.chartData.length > 10) {
      // this.chartData.shift();
    }
  
    
    // Update the chart series with the new data
    this.chart.updateSeries(this.chartData);

    
  }
  

  stopApiResponse =  () => {
    this.socket.close()
    this.tableRes = []
    this.btnDisabled = false
    this.isShowScanImage = true
    this.isScanEnable = false

    console.log(this.chartData,this.chartData.map((a:any)=>{
      console.log(a,a.data.map((k:any)=>k.y),)
      return {
        name:a.name,
        data:a.data.map((k:any)=>k.y),
      }
    }))
    this.chartScan = new ApexCharts(document.querySelector("#chart_scan"), {
      // series: [{
      //   data: this.chartData
      // }],
      series: this.chartData.map((a:any)=>{
        return {
          name:a.name,
          data:a.data.map((k:any)=>k.y),
        }
      }),
      chart: {
        type: 'line',
        height: 170,
        width:800
      },
      labels: this.chartData[0].data.map((k:any)=>k.x),
      stroke: {
          curve: 'smooth',
        },
    
    });
  
    this.chartScan.render();



  }
  ngOnInit(): void {
    // this.chartData = [10, 20, 30, 40, 50];
    this.socket = new WebSocket("ws://localhost:8080");
    
  }

  ngAfterViewInit() {
  
  }
  

}
