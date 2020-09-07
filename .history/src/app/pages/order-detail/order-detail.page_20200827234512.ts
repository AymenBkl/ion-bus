import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController, ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { SelectDriversPage } from '../select-drivers/select-drivers.page';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {

  tab_id;
  id: any;
  grandTotal: any;
  orders: any[] = [];
  serviceTax: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  restName: any;
  userName: any;
  userEmail: any;
  userPic: any;
  phone: any;
  token: any;
  deliveryAddress: any;
  changeStatusOrder: any;
  drivers: any[] = [];
  dummyDriver: any[] = [];
  userLat: any;
  userLng: any;
  paid: any;
  orderString: any[][] = [];
  loaded: boolean;
  table: any;
  notes: any;
  currency = '';
  categories = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private printer: Printer,
    private modalController: ModalController) {
    this.loaded = false;
  }

  ngOnInit() {
    this.currency = localStorage.getItem('selectedCountry') == "IE" ? '€' : '£';
    this.route.queryParams.subscribe(data => {
      console.log(data);
      this.id = data.id;
      console.log('thisidd', this.id);
      this.api.getVenueCategories(localStorage.getItem('uid')).then(data => {
          if(data)
            this.categories = data;
      });
      this.getOrder();
    });
  }

  back() {
    this.util.publishNewAddress('hello');
    this.navCtrl.back();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: SelectDriversPage,
      backdropDismiss: false,
      showBackdrop: true,
      componentProps: {
        item: this.dummyDriver
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role === 'selected') {
        this.drivers = data.data;
        if (this.drivers && this.drivers.length) {
          this.placeOrder();
        }
      }
    });
    await modal.present();
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  placeOrder() {

    let driverId = this.util.makeid(10)
    let dId = this.util.makeid(10)
    const param = {
      driverId: driverId,
      dId: dId,
      status: 'accepted'
    };
    const value = 'accepted';
    this.util.show(this.util.translate('Please wait'));
    this.api.updateOrder(this.id, param).then((data) => {
      const parm = {
        current: 'busy',
      };
      this.api.updateProfile(driverId, parm).then((data) => {
        console.log(data);
      }).catch(error => {
        console.log(error);
      });
      // if (this.drivers[0] && this.drivers[0].fcm_token !== '') {
      //   this.api.sendNotification(this.util.translate('New Order Received '),
      //     this.util.translate('New Order'), this.drivers[0].fcm_token).subscribe((data) => {
      //       console.log('send notifications', data);
      //     }, error => {
      //       console.log(error);
      //     });
      // }
      console.log('data', data);
      const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.restName;
      this.api.sendNotification(msg, 'Order ' + value, this.token).subscribe((data) => {
        console.log(data);
        this.util.hide();
        this.navCtrl.back();
      }, error => {
        this.util.hide();
        console.log('err', error);
      });
      this.util.publishNewAddress('hello');
      Swal.fire({
        title: this.util.translate('success'),
        text: this.util.translate('Order status changed to ') + value,
        icon: 'success',
        timer: 2000,
        backdrop: false,
        background: 'white'
      });
      this.navCtrl.back();
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getDrivers() {
    this.api.getDrivers().then((data) => {
      console.log('drivers', data);
      this.dummyDriver = [];
      this.drivers = [];
      if (data && data.length > 0) {
        data.forEach(async (element) => {
          const distance = await this.distanceInKmBetweenEarthCoordinates(
            this.userLat,
            this.userLng,
            parseFloat(element.lat),
            parseFloat(element.lng));
          console.log(distance);
          if (element.current === 'active' && element.status === 'active') {
            element.distance = distance ? distance : 10;
            this.dummyDriver.push(element);
          }
        });
        data.forEach(async (element) => {
          const distance = await this.distanceInKmBetweenEarthCoordinates(
            this.userLat,
            this.userLng,
            parseFloat(element.lat),
            parseFloat(element.lng));
          if (distance < 10 && element.current === 'active' && element.status === 'active') {
            this.drivers.push(element);
          }
        });
      }
    }).catch(error => {
      console.log(error);
    });
  }

  getOrder() {

    this.api.getOrderById(this.id).then((data) => {
      this.loaded = true;
      console.log(data);
      if (data) {
        this.grandTotal = data.grandTotal;
        this.orders = JSON.parse(data.order);
        this.serviceTax = data.serviceTax;
        this.status = data.status;
        this.time = data.time;
        this.total = data.total;
        this.address = data.vid.address;
        this.table = data.table;
        this.notes = data.notes;
        this.restName = data.vid.name;
        this.deliveryAddress = data.address.address;
        if (data && data.vid && data.vid.lat) {
          this.userLat = data.vid.lat;
          this.userLng = data.vid.lng;
        }
        this.userName = data.uid.fullname;
        this.phone = data.uid.phone;
        this.token = data.uid.fcm_token;
        this.userEmail = data.uid.email;
        this.paid = data.paid;
        this.userPic = data.uid && data.uid.cover ? data.uid.cover : 'assets/imgs/user.jpg';
        console.log('this', this.orders);
        this.getDrivers();
        this.fillInCats();
        this.fillInOrders(this.orders);
        
      }
    }, error => {
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
      console.log('error in orders', error);
    }).catch(error => {
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
      console.log('error in order', error);
    });
  }
  goToTracker() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
  }

  changeStatus(value) {
    if (value === 'accepted') {
      console.log('accepted', this.drivers);
      // this.presentModal();
      this.placeOrder();

    } else {
      this.util.show(this.util.translate('Please wait'));
      this.api.updateOrderStatus(this.id, value).then((data) => {

        console.log('data', data);
        const msg = this.util.translate('Your Order is ') + value + this.util.translate(' By ') + this.restName;
        this.api.sendNotification(msg, 'Order ' + value, this.token).subscribe((data) => {
          console.log(data);
          this.util.hide();
          this.navCtrl.back();
        }, error => {
          this.util.hide();
          console.log('err', error);
        });
        this.util.publishNewAddress('hello');
        Swal.fire({
          title: this.util.translate('success'),
          text: this.util.translate('Order status changed to ') + value,
          icon: 'success',
          timer: 2000,
          backdrop: false,
          background: 'white'
        });
        this.navCtrl.back();
      }).catch(error => {
        console.log(error);
        this.util.hide();
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
    }

  }
  changeOrderStatus() {
    console.log('order status', this.changeStatusOrder);
    if (this.changeStatusOrder) {
      this.changeStatus(this.changeStatusOrder);
    }
  }
  call() {
    if (this.phone) {
      window.open('tel:' + this.phone);
    } else {
      this.util.errorToast(this.util.translate('Number not found'));
    }
  }
  email() {
    if (this.userEmail) {
      window.open('mailto:' + this.userEmail);
    } else {
      this.util.errorToast(this.util.translate('Email not found'));
    }
  }

  printOrder() {
    
    this.orderString.forEach(item => {
        const printerUrl = item.shift();
        const order = item.join('');
        const content = '<div style="padding: 20px;display: flex;flex-direction: column;"> <img src="assets/imgs/logo.jpg" style="text-align: center; height: 100px;width: 100px;" alt="">  <p style="float: left;"><b>' + this.restName + '</b></p> <p style="float: left;">Table No: <b>' + this.table + '</b></p> <p style="float: left;"><b>' + this.userName + '</b></p> <p style="float: left;">' + this.time + ' </p> <p style="font-weight: bold;">' + this.util.translate('ITEMS') + '</p> ' + order + ' <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('SubTotal') + '</span> <span style="float: right;font-weight: bold;">' + this.currency + '' + this.total + '</span>   <p style="border-bottom: 1px solid black;"><span style="float: left;font-weight: bold;">' + this.util.translate('Total') + '</span> <span style="float: right;font-weight: bold;">' + this.currency + '' + this.grandTotal + '</span> </p>   </div>';
        const options: PrintOptions = {
            name: 'Order Summary',
            printer: printerUrl
          };
        this.printer.print(content, options).then((data) => {
          console.log(data);
        }).catch(error => {
          console.log(error);
        });
    }) 
    
  }

  fillInOrders(orders: any[]){
    this.categories.forEach(cat => {
        if(cat.orders.length != 0){
            if(this.orderString.length == 0){
                this.orderString.push([
                    undefined,
                    '<h5>' + cat.name + '</h5>'
                ])
            }else{
                this.orderString.forEach(item => {
                    item.push('<h5>' + cat.name + '</h5>');
                });
            }
        }
        
        
        cat.orders.forEach(order => {
            var found: boolean = false
            this.orderString.forEach(item => {
                if(item[0] == order.printer){
                    item.push('<p style="border-bottom: 1px dashed black;"><span style="float: left;">' + order.name + ' X ' + order.quantiy + ' </span> <span style="float: right;"> ' + this.currency + '' + order.price + '</span> </p>')
                    found = true;
                    return;
                }
            });
            if(!found){
                this.orderString.push([
                    order.printer,
                    '<p style="border-bottom: 1px dashed black;"><span style="float: left;">' + order.name + ' X ' + order.quantiy + ' </span> <span style="float: right;"> ' + this.currency + '' + order.price + '</span> </p>'
                ])
            }
        });
    })
    
    console.log(this.orderString)
  }

  fillInCats(){
      this.categories.forEach(cat => {
          cat.orders = [];

          this.orders.forEach(order => {
              if(order.cid.id == cat.id){
                  cat.orders.push(order);
                  return;
              }
          });

      })

      console.log(this.categories);
  }
}
