import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import { Router, NavigationExtras } from "@angular/router";
import { AngularFirestore } from "angularfire2/firestore";
import Swal from "sweetalert2";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.page.html",
  styleUrls: ["./orders.page.scss"],
})
export class OrdersPage implements OnInit {
  
  /** The default segment to present on load: Ongoing Orders */
  seg_id = 2;

  oldOrders: any[] = [];
  onGoingOrders: any[] = [];

  dummy = Array(50);
  currency = "";
  blink: boolean = false;

  categories = [];
  constructor(
    private api: ApisService,
    private util: UtilService,
    private router: Router,
    private adb: AngularFirestore,
    private cd: ChangeDetectorRef
  ) {
    this.util.obserOrder().subscribe((data) => {
      this.blink = true;
      cd.detectChanges();
      setTimeout(() => {
        this.blink = false;
        cd.detectChanges();
      }, 30000);
    });

    if (localStorage.getItem("uid")) {
      this.adb
        .collection("orders", (ref) =>
          ref.where("restId", "==", localStorage.getItem("uid"))
        )
        .snapshotChanges()
        .subscribe((data: any) => {
          if (data) {
            this.getOrders();
          }
        });
    }
  }

  ngOnInit() {
    this.api
      .getCity(localStorage.getItem("cityId"))
      .then((city) => {
        localStorage.setItem("selectedCountry", city.country);
        this.currency =
          localStorage.getItem("selectedCountry") == "IE" ? "€" : "£";
      })
      .catch((error) => {
        console.log(error);
      });
  }

  ngAfterViewInit() {
    // console.log("ngAfterViewInit");
  }

  ionViewWillEnter() {
    this.oldOrders = [];
    this.onGoingOrders = [];
    this.dummy = Array(50);

    this.api.getVenueCategories(localStorage.getItem("uid")).then((data) => {
      this.categories = data;
    });

    this.api
      .getVenueDetails(localStorage.getItem("uid"))
      .then((data) => {
        if (!data) {
          this.util.showSimpleAlert("Please create your venue profile first");
          this.router.navigate(["venue-profile"]);
          this.dummy = [];
        } else if (data.status === "close") {
          this.router.navigate(["login"]);
          localStorage.removeItem("uid");
          Swal.fire({
            title: this.util.translate("Error"),
            text: this.util.translate(
              "Your are blocked please contact administrator"
            ),
            icon: "error",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: this.util.translate("Need Help?"),
            backdrop: false,
            background: "white",
          }).then((data) => {
            if (data && data.value) {
              this.router.navigate(["inbox"]);
            }
          });
        } else {
          this.getOrders();
        }
      })
      .catch((error) => {
        this.dummy = [];
        console.log(error);
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }

  /** Handler for switching views */
  onClick(val) {
    this.seg_id = val;
  }

  goToOrderDetail(ids) {
    const navData: NavigationExtras = {
      queryParams: {
        id: ids,
      },
    };
    this.router.navigate(["/order-detail"], navData);
  }

  getOrders() {
    this.dummy = Array(50);
    this.api
      .getMyOrders(localStorage.getItem("uid"))
      .then(
        (data) => {
          this.dummy = [];
          if (data && data.length > 0) {

            this.oldOrders = [];
            this.onGoingOrders = [];

            // Process order lines
            data.forEach((element) => {
              element.order = JSON.parse(element.order);
              if (this.filterOrder(element)) {
                if (element.status === "created" ||
                  element.status === "accepted" ||
                  element.status === "ongoing"
                ) {
                  this.onGoingOrders.push(element);
                } else if (
                  element.status === "delivered" ||
                  element.status === "cancel" ||
                  element.status === "rejected"
                ) {
                  this.oldOrders.push(element);
                }
              } else {
                console.log("Order discarded");
              }
            });

            const dateAscending = (a: { time: string }, b: { time: string }) =>
              new Date(a.time).getTime() - new Date(b.time).getTime();

            const dateDescending = (a: { time: string }, b: { time: string }) =>
              dateAscending(b, a);

            const processForDisplay = (orders, sorter) => {
              for (let order of orders) {
                order.grandTotal = parseFloat(order.grandTotal).toFixed(2);
                order.paymentInfo = this.getPaymentInfo(order);
                order.cats = [];
                this.categories.forEach((cat) => {
                  order.cats.push(JSON.parse(JSON.stringify(cat)));
                });
                for (let cat of order.cats) {
                  cat.orders = [];
                  order.order.forEach((o) => {
                    if (cat.id == o.cid.id) {
                      cat.orders.push(o);
                      return;
                    }
                  });
                }
              }
              orders.sort(sorter);
            }

            processForDisplay(this.onGoingOrders, dateDescending);
            processForDisplay(this.oldOrders, dateAscending);

            // this.onGoingOrders.forEach((order) => {
            //   order.grandTotal = parseFloat(order.grandTotal).toFixed(2);
            //   order.paymentInfo = this.getPaymentInfo(order);
            //   order.cats = [];
            //   this.categories.forEach((cat) => {
            //     order.cats.push(JSON.parse(JSON.stringify(cat)));
            //   });

            //   order.cats.forEach((cat) => {
            //     cat.orders = [];
            //     order.order.forEach((o) => {
            //       if (cat.id == o.cid.id) {
            //         cat.orders.push(o);
            //         return;
            //       }
            //     });
            //   });
            // });
            // this.oldOrders.forEach((order) => {
            //   order.grandTotal = parseFloat(order.grandTotal).toFixed(2);
            //   order.paymentInfo = this.getPaymentInfo(order);
            //   order.cats = [];
            //   this.categories.forEach((cat) => {
            //     order.cats.push(JSON.parse(JSON.stringify(cat)));
            //   });

            //   order.cats.forEach((cat) => {
            //     cat.orders = [];
            //     order.order.forEach((o) => {
            //       if (cat.id == o.cid.id) {
            //         cat.orders.push(o);
            //         return;
            //       }
            //     });
            //   });
            // });

            // this.onGoingOrders.sort(dateAscending);
            // this.oldOrders.sort(dateDescending);

            // console.log('ongoing', this.onGoingOrders);
            // console.log('totals', this.oldOrders.map(i => parseInt(i.grandTotal).toFixed(2)));
          }
        },
        (err) => {
          console.log(err);
          this.dummy = [];
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((e) => {
        console.log(e);
        this.dummy = [];
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }
  getProfilePic(item) {
    return item && item.cover ? item.cover : "assets/imgs/user.jpg";
  }

  filterOrder(element): boolean {
    for (var i = element.order.length - 1; i >= 0; i--) {
      var order = element.order[i];
      var checked = localStorage.getItem("scat" + order.cid.id);
      if (checked == null || checked == "false") {
        element.order.splice(i, 1);
      }
    }
    if (element.order.length == 0) return false;
    else return true;
  }

  ionViewWillLeave() {
    this.blink = false;
    this.cd.detectChanges();
  }

  getPaymentInfo(item) {
    if (item.paid === "stripe") {
      return {
        icon: "card-outline",
        color: "mauve",
        caption: "CARD",
      };
    }
    if (item.paid === "cod") {
      return {
        icon: "cash-outline",
        color: "darkgreen",
        caption: "CASH",
      };
    }
  }

}
