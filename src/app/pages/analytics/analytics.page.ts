import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { Router } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import {File} from '@ionic-native/file';
import * as moment from 'moment';
import Swal from 'sweetalert2';

declare let cordova: any;

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {
  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels = [/*this.util.translate('New Orders'), */this.util.translate('Completed'),
  this.util.translate('On Going'), this.util.translate('Others')];
  public pieChartData: number[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  // public pieChartPlugins = [pluginDataLabels];
  public pieChartColors = [
    {
      backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)', '#e61212'],
    },
  ];
  totalEarning: any = 0;
  loaded: boolean;
  report: any = 'all';
  allOrders: any[] = [];
  categories: any[] = [];
  currency = '';
  constructor(
    private api: ApisService,
    private util: UtilService,
    private router: Router
  ) {
    this.loaded = false;
  }

  ngOnInit() {
    this.currency = localStorage.getItem('selectedCountry') == "IE" ? '€' : '£';
  }
  ionViewWillEnter() {
    this.getCategories();
    this.api.getVenueDetails(localStorage.getItem('uid')).then(data => {
      console.log(data);
      if (!data) {
        console.log('no data');
        this.util.showSimpleAlert(this.util.translate('Please create your venue profile first'));
        this.router.navigate(['venue-profile']);
      } else {
        this.getOrders();
      }
    }).catch(error => {
      console.log(error);
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });

  }

  onSaveCSV(){
    if(!this.loaded) return;
    var orders = this.getTodaysOrders();

    if(orders.length == 0){
        this.util.errorToast("No orders available to calculate for today.");
    }

    var categories = this.getCSVCategories();
    var csvItems = [];

    var csv = ""
    orders.forEach(order =>{
        order.order.forEach(element => {
            let catId = element.cid.id;
            var done = false;
    
            categories.forEach(category => {
                if(catId == category.id){
                    category.orders.push(element);
                    done = true;
                    return;
                }
            });
    
            if(!done){
                categories[0].orders.push(element);
            }
        })
    });

    var totalGross = 0.0;
    var totalQty = 0;
    var totalVat = 0.0;
    var totalGrossAfterVat = 0.0;
    categories.forEach(cat => {
        var qty = 0;
        var gross = 0.0;
        var orders = [];

        cat.orders.forEach(order => {
            qty += order.quantiy;
            gross += order.price * order.quantiy;

            orders.push({
                name : order.name,
                qty: order.quantiy,
                gross: order.price * order.quantiy,
            })
        });

        orders.forEach(order => {
            order.percent = order.gross / gross * 100;
        });
        
        totalGross += gross;
        totalQty += qty;

        let vatGross = gross * cat.vat / 100;
        let grossAfterVat = gross - vatGross;

        totalVat += vatGross;
        totalGrossAfterVat += grossAfterVat;

        csvItems.push({
            categoryName: cat.name,
            qty: qty,
            gross: gross,
            vat: cat.vat,
            vatGross: vatGross,
            grossAfterVat: grossAfterVat,
            orders: orders
        });
    });

    csvItems.forEach(item => {
        item.percent = item.gross / totalGross * 100;
    });

    csv += "Printed on " + moment().format("llll") + "\n";
    csv += "\n";
    csv += "Group Totals Report" + "\n";
    csv += "Item Group,Qty,Gross Sales,% OfTotal" + "\n";
    csvItems.forEach(item => {
        if(item.qty == 0) return;
        csv += item.categoryName + "," + item.qty + "," + item.gross + "," + item.percent.toFixed(2) + "\n";
    })
    csv += "Report Totals" + "," + totalQty + "," + totalGross + "," + "100%" + "\n";
    csv += "\n";
    csv += "Items Sales Report" + "\n";
    csv += "Item,Qty,Gross Sales,% OfTotal" + "\n";
    csvItems.forEach(item => {
        if(item.qty == 0) return;
        csv += item.categoryName + "\n";
        item.orders.forEach(order => {
            csv += order.name + "," + order.qty + "," + order.gross + "," + order.percent.toFixed(2) + "\n";
        })
    })
    csv += "Report Totals" + "," + totalQty + "," + totalGross + "," + "100%" + "\n";

    csv += "\n";
    csv += "VAT Calculation" + "\n";
    csv += "Item Group,VAT Percent,Gross Sales,VAT Collected,Sales less VAT" + "\n";
    csvItems.forEach(item => {
        if(item.qty == 0) return;
        csv += item.categoryName + "," + item.vat + "," + item.gross + "," + item.vatGross.toFixed(2) + "," + item.grossAfterVat.toFixed(2) + "\n";
    });
    csv += "Report Totals" + "," + "-" + "," + totalGross + "," + totalVat.toFixed(2) + "," + totalGrossAfterVat.toFixed(2) + "\n";

    console.log(csv);
    this.writeCSVToFile(csv);
  }

  writeCSVToFile(csv){
    
    if((<any>window).device.platform === "Android"){
        console.log('writing csv in android')
        this.writeCSVToFileToFolderPath(csv, cordova.file.externalRootDirectory + "Documents/");
    }else if((<any>window).device.platform === "iOS"){
        console.log('writing csv in ios')
        this.writeCSVToFileToFolderPath(csv, cordova.file.documentsDirectory);
    }else{
        Swal.fire({
            title: 'Not supported',
            text: 'Platform not supported.',
            icon: 'error',
            timer: 2000,
            backdrop: false,
            background: 'white'
          });
    }
    
  }
  writeCSVToFileToFolderPath(csv, folderPath){
    var analytics = this;
    console.log("FOLDERPATH: " + folderPath);
    (<any>window).resolveLocalFileSystemURL(folderPath, function (dirEntry) {
        console.log('file system open: ' + dirEntry.name);
        console.log("FILENAME: " + analytics.getFormattedTimeFileName());
        dirEntry.getFile(analytics.getFormattedTimeFileName(), {create: true, exclusive: false}, function(fileEntry) {

        var dataObj = new Blob([csv], {type: 'text/plain'});
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
                console.log(fileEntry);
            };

            fileWriter.onerror = function (e) {
                analytics.util.errorToast("Failed to write file.");
                console.log("Failed file write: " + e.toString());
            };

            fileWriter.write(dataObj);

            Swal.fire({
                title: 'CSV Saved',
                text: 'CSV File saved to Documents.',
                icon: 'success',
                timer: 2000,
                backdrop: false,
                background: 'white'
              });
        });
        }, error => {
            console.log(error.code);
            analytics.util.errorToast("Unable to create file.")
        });
    }, error => {
        console.log(error);
        this.util.errorToast("Unable to access folder");
    });
  }

  getFormattedTimeFileName() {
    var today = new Date();
    var y = Math.round(today.getFullYear());
    // JavaScript months are 0-based.
    var m = Math.round(today.getMonth() + 1);
    var d = Math.round(today.getDate());
    var h = Math.round(today.getHours());
    var mi = Math.round(today.getMinutes());
    var s = Math.round(today.getSeconds());
    return "" + y + "-" + m + "-" + d + "_" + h + "-" + mi + "-" + s + ".csv";
  }

  getTodaysOrders(): any[]{
    var todaysOrders : any[] = [];

    this.allOrders.forEach(element => {
        if(element.status == 'delivered'){
            if(moment().dayOfYear() == moment(element.time).dayOfYear()){
                todaysOrders.push(element)
            }
        }
    });

    return todaysOrders;
  }

  getCSVCategories(): any[] {
    var ret = [];

    ret.push({
        id : "unknown",
        name: "Unknown (Maybe Deleted)",
        vat: 0,
        orders: []
    });

    this.categories.forEach(category => {
        if(category.vat == null)
            category.vat = 0;
        ret.push({
            id : category.id,
            name: category.name,
            vat: category.vat,
            orders: []
        });
    });

    return ret;
  }

  getOrders() {
    console.log('vid', localStorage.getItem('uid'));
    this.api.getMyOrders(localStorage.getItem('uid')).then((data) => {
      this.loaded = true;
      console.log('orders', data);
      if (data && data.length > 0) {
        this.allOrders = data;

        let newOrders = [];
        let onGoingOrders = [];
        let oldOrders = [];
        let others = [];
        this.totalEarning = 0;
        data.forEach(element => {
          element.order = JSON.parse(element.order);
          this.totalEarning = this.totalEarning + parseFloat(element.grandTotal);
          if (element.status === 'created') {
            newOrders.push(element);
          } else if (element.status === 'accepted' || element.status === 'ongoing') {
            onGoingOrders.push(element);
          } else if (element.status === 'delivered') {
            oldOrders.push(element);
          } else if (element.status === 'cancel') {
            others.push(element);
          }
        });
        this.totalEarning = parseFloat(this.totalEarning).toFixed(2);
        console.log('new order', newOrders);
        this.pieChartData = [];
        //this.pieChartData.push(newOrders.length); // new orders
        this.pieChartData.push(oldOrders.length); // completed
        this.pieChartData.push(onGoingOrders.length); // ongoing
        this.pieChartData.push(others.length); // others
        console.log('pi data', this.pieChartData);
      } else {
        //this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
      }
    }, err => {
      console.log(err);
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(e => {
      this.util.hide();
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  getCategories() {
    
    this.api.getVenueCategories(localStorage.getItem('uid')).then((data) => {
      console.log(data);
      data = data.sort(function(a, b){
            try{
                if(a.date_added < b.date_added)
                    return -1;
                else 
                    return 1;
            }catch(Exception){
                return -1;
            }
      });
      if (data) {
        this.categories = data;
      }
    }, error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  changeMode() {
    console.log(this.report);
    if (this.report === 'now') {
      console.log('crren mnth', this.allOrders);
      //const currentMonth = moment().format('MM');
      let currentDay = moment().dayOfYear();
      console.log('currentDay', currentDay);
      if (this.allOrders.length) {
        let newOrders = [];
        let onGoingOrders = [];
        let oldOrders = [];
        let others = [];
        this.totalEarning = 0;
        this.allOrders.forEach(element => {
          //let orderMonth = moment(element.time).format('MM');
          let orderDay = moment(element.time).dayOfYear();
          console.log('orderDay', orderDay);
          if (currentDay === orderDay) {
            this.totalEarning = this.totalEarning + parseFloat(element.grandTotal);
            /*if (element.status === 'created') {
              newOrders.push(element);
            } else 
            */if (element.status === 'accepted' || element.status === 'ongoing') {
              onGoingOrders.push(element);
            } else if (element.status === 'delivered') {
              oldOrders.push(element);
            } else if (element.status === 'cancel') {
              others.push(element);
            }
          }
        });
        this.totalEarning = parseFloat(this.totalEarning).toFixed(2);
        console.log('new order', newOrders);
        this.pieChartData = [];
        //this.pieChartData.push(newOrders.length); // new orders
        this.pieChartData.push(oldOrders.length); // completed
        this.pieChartData.push(onGoingOrders.length); // ongoing
        this.pieChartData.push(others.length); // others
        console.log('pi data', this.pieChartData);
      } else {
        //this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
      }
    } else {
      if (this.allOrders.length) {
        let newOrders = [];
        let onGoingOrders = [];
        let oldOrders = [];
        let others = [];
        this.totalEarning = 0;
        this.allOrders.forEach(element => {

          this.totalEarning = this.totalEarning + parseFloat(element.grandTotal);
          if (element.status === 'created') {
            newOrders.push(element);
          } else if (element.status === 'accepted' || element.status === 'ongoing') {
            onGoingOrders.push(element);
          } else if (element.status === 'delivered') {
            oldOrders.push(element);
          } else if (element.status === 'cancel') {
            others.push(element);
          }
        });
        console.log('new order', newOrders);
        this.pieChartData = [];
        this.pieChartData.push(newOrders.length); // new orders
        this.pieChartData.push(oldOrders.length); // completed
        this.pieChartData.push(onGoingOrders.length); // ongoing
        this.pieChartData.push(others.length); // others
        console.log('pi data', this.pieChartData);
      } else {
        this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
        this.pieChartData.push(0);
      }
    }
  }
}
