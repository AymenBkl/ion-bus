import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.page.html',
  styleUrls: ['./foods.page.scss'],
})
export class FoodsPage implements OnInit {
  foods: any[] = [];
  categories: any[] = [];
  dummy = Array(50);
  currency = '';
  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private alertController:AlertController
  ) {

  }

  ngOnInit() {
    this.currency = localStorage.getItem('selectedCountry') == "IE" ? '€' : '£';
  }
  ionViewWillEnter() {
    this.getFoods();
  }

  getFoods() {
    this.api.getVenueCategories(localStorage.getItem('uid')).then((data) => {
      console.log(data);
      this.dummy = [];
      if (data) {
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
        this.categories = data;
        this.api.getFoods(localStorage.getItem('uid')).then((data) => {
          if (data) {
            data = data.sort(function(a, b){
                    try{
                        if(a.date_added == null)
                            a.date_added = -1;
                        if(b.date_added == null)
                            b.date_added = 1;
                        if(a.date_added < b.date_added)
                            return -1;
                        else 
                            return 1;
                    }catch(Exception){
                        return -1;
                    }
            });

            console.log(data);
            let foods = []
            data.forEach((v, index) => {
              let subcategory = v.subcategory;
              this.categories.forEach(s => {

                if (s.subcat) {
                  let subcategoryArr = s.subcat.filter(subc => {
                    return subc.id == subcategory
                  });
                  if(subcategoryArr && subcategoryArr.length>0){
                    v.subcategoryName = subcategoryArr[0].name
                  }
                }
              })
            });

            this.categories.forEach(category => {
                category.foods = [];
                data.forEach(food => {
                    if(food.cid.id == category.id)
                        category.foods.push(food);
                });
            });
            this.foods = data;
          }
        }, error => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          this.dummy = [];
          console.log(error);
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });

  }
  addnew() {
    this.router.navigate(['/add-new-foods']);
  }


  async deleteFood(item){
    console.log(item);

    const alert = await this.alertController.create({
      header: 'Delete' + item.name,
      message: 'Are you sure you want to remove this item',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {

            this.api.deleteFood(localStorage.getItem('uid'),item.id).then((data) => {
              console.log(data);
              this.getFoods();

        
            });
            
          }
        }
      ]
    });

    await alert.present();




}


  foodsInfo(item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        id: item.id
      }
    };
    this.router.navigate(['add-new-foods'], navData);
  }
}
