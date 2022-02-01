import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CodeHolland } from 'src/app/core/enums/code-holland.enum';
import { Level } from 'src/app/core/enums/level.enum';
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
    debugger
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
  stepFourResponses: CodeHolland[] = [];
  currentChoice: Level;
  Level = Level;
  index = 0;

  constructor(public toastController: ToastController) {}
  
  async goToNextQuestion(){
    if(this.response == null && this.currentChoice == null){
      (await this.toastController.create({ message: 'Veuillez chosir une réponse', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
    }
    else {
      if(this.question.id_step == '4'){
        for (let i = 0; i < this.currentChoice; i++) {
          this.stepFourResponses.push(this.getCodeHollandStringToEnum(this.question.choix[0].code_holland));
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
