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
  chartData:any = []
  isScanStarted:boolean = false
  isShowScanImage:boolean = false
  constructor() { }


  getApiResponse = () =>{

    this.isScanStarted = true

    this.chart = new ApexCharts(document.querySelector("#chart"), {
      series: [{
        data: this.chartData
      }],
      chart: {
        type: 'bar',
        height: 200,
        width:400
      },
      xaxis: null,
    });
  
    this.chart.render();

    this.btnDisabled = true
    this.socket.onmessage = (e:any)=>{
      // console.log(e.data)
      
      this.tableRes.push(parseInt(e.data))
      console.log(this.tableRes)
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


    this.chartScan = new ApexCharts(document.querySelector("#chart_scan"), {
      series: [{
        data: this.chartData
      }],
      chart: {
        type: 'line',
        height: 170,
        width:800
      },
      xaxis: null,
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
