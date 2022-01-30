import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { HeaderComponent } from "./header/header.component";
import { QuestionComponent } from "./question/question.component";

@NgModule({
    declarations: [
        HeaderComponent,
        QuestionComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports : [
        HeaderComponent,
        QuestionComponent
    ] 
})
export class SharedModule { }