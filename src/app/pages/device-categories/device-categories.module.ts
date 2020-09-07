import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeviceCategoriesPageRoutingModule } from './device-categories-routing.module';

import { DeviceCategoriesPage } from './device-categories.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DeviceCategoriesPageRoutingModule
  ],
  declarations: [DeviceCategoriesPage]
})
export class DeviceCategoriesPageModule {}
