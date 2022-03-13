import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CodeHolland } from 'src/app/core/enums/code-holland.enum';
import { Level } from 'src/app/core/enums/level.enum';
import { ResultChoix } from 'src/app/core/models/choix.model';
import { Question } from 'src/app/core/models/question.model';
import { Reponse } from 'src/app/core/models/reponse.model';
import { TranslatorService } from 'src/app/core/services/translate.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {

  @Input()
  question: Question;

  @Input()
  numberOfQuestions: number;

  @Input()
  set previousResponse(value: CodeHolland | ResultChoix[]){
    if(value != null && ["1", "3"].includes(this.question.id_step)) {
      this.response = this.getCodeHollandEnumToString(value as CodeHolland);
    }
    else if (value != null && this.question.id_step == "2") {
      this.stepTwoResponses = value as ResultChoix[];
    }
  }

  @Output()
  nextQuestionEvent = new EventEmitter<Reponse>();

  response: string;
  stepTwoResponses: ResultChoix[] = [];
  stepFourResponses: ResultChoix[] = [];
  currentChoice: Level;
  Level = Level;
  index = 0;
  isArab: boolean;
  stepFourQuestionsCount = 1;

  constructor(
    public toastController: ToastController,
    public translate: TranslateService, 
    public translatorService: TranslatorService
    ) {}

  ngOnInit(){
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
    this.isArab = localStorage.getItem('language') == "ar";
  }
  
  async goToNextQuestion(){
    if(this.response == null && this.currentChoice == null && this.stepTwoResponses.length == 0){
      (await this.toastController.create({ message: this.translate.instant('PLEASE_CHOOSE'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
    }
    else {
      if(this.question.id_step == '4'){
        for (let i = 0; i < this.currentChoice; i++) {
          this.stepFourQuestionsCount++;
          var choix: ResultChoix = {
            id: this.question.choix[this.index].id,
            code_holland: this.getCodeHollandStringToEnum(this.question.choix[this.index].code_holland)
          }
          this.stepFourResponses.push(choix);
        }

        this.currentChoice = undefined;
        
        if(this.index < this.question.choix.length - 1){
          this.index++;
        }
        else {
          this.index = 0;
          const reponse: Reponse = {
            id_quest: this.question.id_quest,
            id_step: this.question.id_step,
            code_holland: this.stepFourResponses
          }
          this.nextQuestionEvent.emit(reponse);
          this.stepFourResponses = [];
        }
      } else if (this.question.id_step == '2') {
        const reponse: Reponse = {
          id_quest: this.question.id_quest,
          id_step: this.question.id_step,
          code_holland: this.stepTwoResponses
        }
        this.nextQuestionEvent.emit(reponse);
        this.stepTwoResponses = [];
      }
      else {
        const reponse: Reponse = {
          id_quest: this.question.id_quest,
          id_step: this.question.id_step,
          code_holland: this.getCodeHollandStringToEnum(this.response)
        }
        this.nextQuestionEvent.emit(reponse);
        this.response = undefined;
      }
      
    }    
  }

  selectChoice(value: any) {
    this.response = value?.detail?.value;
  }

  selectChoiceBox(value: any) {
    this.currentChoice = value;
  }

  isChecked(id: string) {
    return this.stepTwoResponses.map(e => e.id).includes(id);
  }

  selectStepTwoResponses(value: any, index: number) {
    if (value.detail.checked) {
      var choix: ResultChoix = {
        id: this.question.choix[index].id,
        code_holland: this.getCodeHollandStringToEnum(this.question.choix[index].code_holland)
      }
      this.stepTwoResponses?.push(choix);
    } else {
        this.stepTwoResponses = this.stepTwoResponses.filter(e => e.id !== this.question.choix[index]?.id);
    }
  }

  getCodeHollandStringToEnum(code: string): CodeHolland {
    switch(code){
      case "R":
        return CodeHolland.R;
      case "I":
        return CodeHolland.I;
      case "A":
        return CodeHolland.A;
      case "S":
        return CodeHolland.S;
      case "E":
        return CodeHolland.E;
      case "C":
        return CodeHolland.C;
    }
  }

  getCodeHollandEnumToString(code: CodeHolland): string {
    switch(code){
      case CodeHolland.R:
        return "R";
      case CodeHolland.I:
        return "I";
      case CodeHolland.A:
        return "A";
      case CodeHolland.S:
        return "S";
      case CodeHolland.E:
        return "E";
      case CodeHolland.C:
        return "C";
    }
  }
}
