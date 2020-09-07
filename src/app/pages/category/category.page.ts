import { Component, OnInit } from "@angular/core";
import { ApisService } from "src/app/services/apis.service";
import { AlertController } from "@ionic/angular";
import { UtilService } from "src/app/services/util.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-category",
  templateUrl: "./category.page.html",
  styleUrls: ["./category.page.scss"],
})
export class CategoryPage implements OnInit {
  categories: any[] = [];
  dummy = Array(50);

  constructor(
    private api: ApisService,
    private alertController: AlertController,
    private util: UtilService,
    private router: Router
  ) {
    this.getCategories();
  }

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
            this.categories = data;
            this.categories.forEach((category) => {
              category.show = false;
            });
            this.categories[0].show = true;
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

  async deleteCategory(id) {
    console.log(id);

    const alert = await this.alertController.create({
      header: "Delete Category",
      message: "Are you sure you want to remove this category",
      buttons: [
        {
          text: "No",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            console.log("Confirm Cancel: blah");
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.api.deleteCategory(id).then((data) => {
              console.log(data);
              this.getCategories();
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteSubcat(id, parentID) {
    console.log(id);

    const alert = await this.alertController.create({
      header: "Delete Category",
      message: "Are you sure you want to remove this category",
      buttons: [
        {
          text: "No",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            console.log("Confirm Cancel: blah");
          },
        },
        {
          text: "Yes",
          handler: () => {
            this.api.deleteSubcategory(id, parentID).then((data) => {
              console.log(data);
              this.getCategories();
            });
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnInit() {}

  async addNewCat() {
    const alert = await this.alertController.create({
      header: this.util.translate("Add New!"),
      inputs: [
        {
          name: "name1",
          type: "text",
          placeholder: this.util.translate("Category Name"),
        },
        {
          name: "vat",
          type: "number",
          placeholder: "VAT Percentage",
        },
      ],
      buttons: [
        {
          text: this.util.translate("Cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: this.util.translate("Ok"),
          handler: (data) => {
            console.log("Confirm Ok", data);
            if (data && data.name1 !== "") {
              console.log("add new");
              const ids = this.util.makeid(10);
              const param = {
                uid: localStorage.getItem("uid"),
                name: data.name1,
                id: ids,
                vat: <number>data.vat,
                show: true,
              };
              this.util.show();
              this.api
                .addVenueCategoies(localStorage.getItem("uid"), ids, param)
                .then((data) => {
                  this.util.hide();
                  console.log(data);
                  this.getCategories();
                })
                .catch((error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  console.log(error);
                });
            }
          },
        },
      ],
    });

    await alert.present();

    // this.router.navigate(['/add-category'])
  }

  async edit(item) {
    // console.log(item);
    const alert = await this.alertController.create({
      header: this.util.translate("Edit"),
      inputs: [
        {
          name: "name1",
          type: "text",
          placeholder: this.util.translate("Category Name"),
          value: item.name,
        },
        {
          name: "vat",
          type: "number",
          placeholder: "VAT Percentage",
          value: item.vat,
        },
      ],
      buttons: [
        {
          text: this.util.translate("Cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: this.util.translate("Ok"),
          handler: (data) => {
            console.log("Confirm Ok", data);
            if (data && data.name1 !== "") {
              console.log("add new");

              const param = {
                uid: localStorage.getItem("uid"),
                name: data.name1,
                id: item.id,
                vat: data.vat,
              };
              this.util.show();
              this.api
                .updateVenueCategoies(
                  localStorage.getItem("uid"),
                  item.id,
                  param
                )
                .then((data) => {
                  this.util.hide();
                  console.log(data);
                  this.getCategories();
                })
                .catch((error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  console.log(error);
                });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async addSubCat(item) {
    const alert = await this.alertController.create({
      header: this.util.translate("Add New Subcategory"),
      message: item.name,
      inputs: [
        {
          name: "name1",
          type: "text",
          placeholder: this.util.translate("Subcategory Name"),
        },
      ],
      buttons: [
        {
          text: this.util.translate("Cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: this.util.translate("Ok"),
          handler: (data) => {
            console.log("Confirm Ok", data);
            if (data && data.name1 !== "") {
              console.log("add new");
              const ids = this.util.makeid(10);
              const param = {
                uid: localStorage.getItem("uid"),
                name: data.name1,
                id: ids,
                show: true,
              };
              this.util.show();
              this.api
                .addSubCat(localStorage.getItem("uid"), ids, param, item.id)
                .then((data) => {
                  this.util.hide();
                  console.log(data);
                  this.getCategories();
                })
                .catch((error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  console.log(error);
                });
            }
          },
        },
      ],
    });

    await alert.present();

    // this.router.navigate(['/add-category'])
  }

  async editSubCat(item, parentItem) {
    // console.log(item);
    const alert = await this.alertController.create({
      header: this.util.translate("Edit"),
      inputs: [
        {
          name: "name1",
          type: "text",
          placeholder: this.util.translate("Subcategory Name"),
          value: item.name,
        },
      ],
      buttons: [
        {
          text: this.util.translate("Cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: this.util.translate("Ok"),
          handler: (data) => {
            console.log("Confirm Ok", data);
            if (data && data.name1 !== "") {
              console.log("add new");

              const param = {
                uid: localStorage.getItem("uid"),
                name: data.name1,
                id: item.id,
              };
              this.util.show();
              this.api
                .updateSubCategory(
                  localStorage.getItem("uid"),
                  item.id,
                  param,
                  parentItem
                )
                .then((data) => {
                  this.util.hide();
                  console.log(data);
                  this.getCategories();
                })
                .catch((error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  console.log(error);
                });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  showCategories(category) {
    this.categories.map((item) => {
      if (category.id === item.id) {
        item.show = true;
      }
    });

    this.api.showCategoriesForOther(category.id);
  }

  hideCategories(category) {
    this.categories.map((item) => {
      if (category.id === item.id) {
        item.show = false;
      }
    });

    this.api.hideCategoriesForOther(category.id);
  }

  hideSubCategories(category: any, sub: any) {
    this.categories.map((item) => {
      if (category.id === item.id) {
        item.subcat.map((subcat) => {
          if (subcat.id === sub.id) {
            subcat.show = false;
          }
        });
      }
    });

    this.api.hideSubCategoriesForOther(category.id, category.subcat);
  }

  showSubCategories(category: any, sub: any) {
    this.categories.map((item) => {
      if (category.id === item.id) {
        item.subcat.map((subcat) => {
          if (subcat.id === sub.id) {
            subcat.show = true;
          }
        });
      }
    });

    this.api.showSubCategoriesForOther(category.id, category.subcat);
  }

  toggleGroup(item: any) {
    this.categories.map((category) => {
      if (category.name === item.name) {
        category.show = !category.show;
      }
    });
  }
}
