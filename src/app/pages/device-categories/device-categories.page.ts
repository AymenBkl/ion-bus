import { Component, OnInit } from "@angular/core";
import { ApisService } from "src/app/services/apis.service";
import { AlertController } from "@ionic/angular";
import { UtilService } from "src/app/services/util.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-device-categories",
  templateUrl: "./device-categories.page.html",
  styleUrls: ["./device-categories.page.scss"],
})
export class DeviceCategoriesPage implements OnInit {
  categories: any[] = [];
  dummy = Array(50);

  public cats = [];

  constructor(
    private api: ApisService,
    private alertController: AlertController,
    private util: UtilService,
    private router: Router
  ) {
    this.getCategories();
  }

  ngOnInit() {}

  getCategories() {
    this.api
      .getVenueCategories(localStorage.getItem("uid"))
      .then(
        (data) => {
          this.dummy = [];
          console.log(data);
          data = data.sort(function (a, b) {
            try {
              if (a.date_added < b.date_added) return 1;
              else return -1;
            } catch (Exception) {
              return -1;
            }
          });
          if (data) {
            data.forEach(function (value) {
              value.isChecked = localStorage.getItem("scat" + value.id);
              if (value.isChecked == null) value.isChecked = false;
            });
            this.categories = data;
          }
        },
        (error) => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }

  categoryCheckChanged(id, isChecked) {
    localStorage.setItem("scat" + id, isChecked);
  }
}
