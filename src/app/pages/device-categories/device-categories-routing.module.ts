import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceCategoriesPage } from './device-categories.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeviceCategoriesPageRoutingModule {}
