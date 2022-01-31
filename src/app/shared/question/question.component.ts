import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CodeHolland } from 'src/app/core/enums/code-holland.enum';
import { Level } from 'src/app/core/enums/level.enum';
import { Question } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {

  @Input()
  set isBack(value: boolean){
    debugger
    if(value){
      if(this.index != 0){
        this.index--;
      }
      else {
        this.previousQuestionEvent.emit();
      }
    }
  }

  @Input()
  question: Question;

  @Input()
  numberOfQuestions: number;

  @Output()
  nextQuestionEvent = new EventEmitter();

  @Output()
  previousQuestionEvent = new EventEmitter();

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
          this.stepFourResponses.push(this.getCodeHolland(this.question.choix[0].code_holland));
        }

        this.currentChoice = undefined;
        
        if(this.index < this.question.choix.length - 1){
          this.index++;
        }
        else {
          this.index = 0;
          this.nextQuestionEvent.emit(this.stepFourResponses);
          this.stepFourResponses = [];
        }
      }
      else {
        this.nextQuestionEvent.emit(this.getCodeHolland(this.response));
        this.response = undefined;
      }
      
    }
  }

  selectChoice(value: any) {
    this.response = value?.detail?.value;
  }

  selectChoiceBox(value: any) {
    console.log(value);
    this.currentChoice = value;
  }

  getCodeHolland(code: string): CodeHolland {
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
}
