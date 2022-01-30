import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
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
  question: Question;

  @Input()
  numberOfQuestions: number;

  @Output()
  nextQuestionEvent = new EventEmitter();

  response: CodeHolland;

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
          this.stepFourResponses.push(this.question.choix[0].code_holland);
        }
        if(this.index < this.question.choix.length - 1){
          this.index++;
        }
        else {
          this.index = 0;
          this.currentChoice = undefined;
          this.nextQuestionEvent.emit(this.stepFourResponses);
          this.stepFourResponses = [];
        }
      }
      else {
        this.nextQuestionEvent.emit(this.response);
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
}
