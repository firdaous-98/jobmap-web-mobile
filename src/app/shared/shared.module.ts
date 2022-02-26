import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { HeaderComponent } from "./header/header.component";
import { QuestionComponent } from "./question/question.component";
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslatorService } from '../core/services/translate.service';
import { HttpClient } from '@angular/common/http';

@NgModule({
    declarations: [
        HeaderComponent,
        QuestionComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: { 
              provide: TranslateLoader,
              useFactory: (TranslatorService.createTranslateLoader()),
              deps: [HttpClient]
            }
        })
    ],
    exports : [
        HeaderComponent,
        QuestionComponent
    ] 
})
export class SharedModule { }