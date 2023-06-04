import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import * as Papa from 'papaparse';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) {}


  readCSVFile = async () => {
    await this.http.get('assets/sample.csv', { responseType: 'text' })
      .subscribe(
        data => {
          const parsedData = Papa.parse(data, { header: true }).data;
          console.log(parsedData, typeof parsedData[0]);
          const obj:any = parsedData[0]
          const obj1 = {...obj}
          delete obj1.id
          const itemsList = Object.keys(obj1)
          console.log(itemsList)
          const seriesData: any[] = [];
          itemsList.forEach((i)=>{
            const data:any = [];
            parsedData.slice(0,1000).forEach((j:any)=>{
              // console.log(j)
              const point = { x: j.id, y:  JSON.parse(j[i]) , heat:  JSON.parse(j[i]) };
              data.push(point);
            })
              seriesData.push({
              name: `coil_A${i + 1}`,
              data: data
            });
          })
          console.log('ss', parsedData.slice(100))
          this.chartData = seriesData
          this.updateChartData1(seriesData);
          return seriesData

          // Perform further processing on the parsed data
        },
        error => {
          console.error('Error reading CSV file:', error);
          return []
        }
      );
  }
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
    // uncomment for normal data
    // this.chartData =  generateHeatmapData(1, 0.9)

    // csv data
    // this.chartData = this.readCSVFile()
    this.readCSVFile().then((res)=>{
      console.log(res)
    })
    console.log(this.chartData, 'chratd')

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
                  // labels: this.chartData[config.seriesIndex].data.map((k:any)=>k.x),
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
        },
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
      xaxis: null,
      series: this.chartData
    
    });
  
    this.chart.render();

    this.btnDisabled = true
    let count = 0

    // example --
    // const interval = setInterval(()=>{
    //   this.updateChartData(1)
    // },2000)

    // setTimeout(() => {
    //   clearInterval(interval)
    //   console.log('---sss')
    // }, 10000);
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
    // this.socket.send('getData')
  }

  updateChartData1(data:any) {
    console.log('update called, data', data)
    this.chart.updateSeries(data);
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
    // this.readCSVFile()
    
  }

  ngAfterViewInit() {
  
  }
  

}
