import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslatorService } from '../core/services/translate.service';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: { 
        provide: TranslateLoader,
        useFactory: (TranslatorService.createTranslateLoader()),
        deps: [HttpClient]
      }
  })
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
