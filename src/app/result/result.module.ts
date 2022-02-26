import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultPageRoutingModule } from './result-routing.module';

import { ResultPage } from './result.page';
import { SharedModule } from '../shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslatorService } from '../core/services/translate.service';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    NgApexchartsModule,
    ResultPageRoutingModule,
    TranslateModule.forRoot({
      loader: { 
        provide: TranslateLoader,
        useFactory: (TranslatorService.createTranslateLoader()),
        deps: [HttpClient]
      }
  })
  ],
  declarations: [ResultPage]
})
export class ResultPageModule {}
