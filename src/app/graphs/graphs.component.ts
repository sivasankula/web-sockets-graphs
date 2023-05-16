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
  constructor() { }


  getApiResponse = () =>{

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
    this.chart = new ApexCharts(document.querySelector('#chart'), {
      series: [
        {
          data: this.chartData,
        },
      ],
      chart: {
        type: 'bar',
        height: 200,
        width: 400,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
              if(this.chartLiveAmp){
                this.chartLiveAmp.destroy()
              this.chartLiveAmp = null;
              }
              console.log(config.dataPointIndex, config);
              this.isClickedAny = true;
              this.clickedRecord = config.dataPointIndex;

              this.chartLiveAmp = new ApexCharts(
                document.querySelector('#chart_liveAmp'),
                {
                  series: [
                    {
                      data: [this.chartData[config.dataPointIndex]],
                    },
                  ],
                  chart: {
                    type: 'bar',
                    height: 200,
                    width: 300,
                  },
                }
              );

              this.chartLiveAmp.render();
          },
        },
      },
      xaxis: null,
    });
  
    this.chart.render();

    this.btnDisabled = true
    this.socket.onmessage = (e:any)=>{
      // console.log(e.data)
     
      this.updateChartData(parseInt(e.data))
    }
    this.socket.onclose = (e:any)=>{
      this.socket = new WebSocket("ws://localhost:8080");
    }
    console.log('api called')
    this.socket.send('getData')
  }

  updateChartData(newData: number) {
    // Add the new data to the chart data array
    this.chartData.push(newData);
  
    // Limit the chart data array to a maximum of 10 items
    if (this.chartData.length > 10) {
      // this.chartData.shift();
    }
  
    // Update the chart series with the new data
    this.chart.updateSeries([{
      data: this.chartData
    }]);
  }
  

  stopApiResponse =  () => {
    this.socket.close()
    this.tableRes = []
    this.btnDisabled = false
    this.isShowScanImage = true
    this.isScanEnable = false

    console.log(this.chartData)
    this.chartScan = new ApexCharts(document.querySelector("#chart_scan"), {
      series: [{
        data: this.chartData
      }],
      chart: {
        type: 'line',
        height: 170,
        width:800
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
