import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CodeHolland } from 'src/app/core/enums/code-holland.enum';
import { Level } from 'src/app/core/enums/level.enum';
import { ResultChoix } from 'src/app/core/models/choix.model';
import { Question } from 'src/app/core/models/question.model';
import { Reponse } from 'src/app/core/models/reponse.model';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {

  @Input()
  set isBack(value: boolean){
    if(value){
      if(this.index != 0){
        this.index--;
      }
      else {
        // this.previousQuestionEvent.emit();
      }
    }
  }

  @Input()
  question: Question;

  @Input()
  numberOfQuestions: number;

  @Input()
  set previousResponse(value: CodeHolland | CodeHolland[]){
    if(value != null && typeof value == 'number'){
      this.response = this.getCodeHollandEnumToString(value);
    }
    else {
      switch((value as CodeHolland[])?.length){
        case 1:
          this.currentChoice = Level.Faible;
        case 2: 
          this.currentChoice = Level.Moyen;
        case 3:
          this.currentChoice = Level.Fort;
      }
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

  constructor(public toastController: ToastController) {}
  
  async goToNextQuestion(){
    if(this.response == null && this.currentChoice == null && this.stepTwoResponses.length == 0){
      (await this.toastController.create({ message: 'Veuillez choisir une réponse', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
    }
    else {
      if(this.question.id_step == '4'){
        for (let i = 0; i < this.currentChoice; i++) {
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
            code_holland: this.stepFourResponses
          }
          this.nextQuestionEvent.emit(reponse);
          this.stepFourResponses = [];
        }
      } else if (this.question.id_step == '2') {
        const reponse: Reponse = {
          id_quest: this.question.id_quest,
          code_holland: this.stepTwoResponses
        }
        this.nextQuestionEvent.emit(reponse);
        this.stepTwoResponses = [];
      }
      else {
        const reponse: Reponse = {
          id_quest: this.question.id_quest,
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
