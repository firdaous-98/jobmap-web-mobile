import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AccountService } from '../core/services/account.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TranslatorService } from '../core/services/translate.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;

  submissionType : 'login' | 'join' = 'login';
  passwordType = 'password';
  regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  TOKEN = 'token';


  constructor(
    private accountService: AccountService, 
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    private router: Router,
    public toastController: ToastController
    ) 
    {
      // this.translate.use(this.translatorService.getSelectedLanguage());
    }

  ngOnInit() {
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
    const helper = new JwtHelperService();
    const token = localStorage.getItem(this.TOKEN);
    if (token != null && !helper.isTokenExpired(token)){
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      if(this.submissionType === 'login') {
        const { email, password } = this.form.value;
        this.accountService.login(email, password).subscribe(async result => {
          if(result.message.includes("Successful")){
            const helper = new JwtHelperService();
            const token = result.jwt;
            if(token != null && !helper.isTokenExpired(token)){
              localStorage.setItem(this.TOKEN, token);              
              this.router.navigate(['/home']);
            }
            else {
              (await this.toastController.create({ message: 'Votre session est expirée', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
            }
          }
          else {
            (await this.toastController.create({ message: 'Connexion echouée', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
          }
        });
      }
      else if(this.submissionType === 'join') {
        const { nom, prenom, email, password} = this.form.value;
        this.accountService.signin(nom, prenom, email, password).subscribe(async result => {
          if(result.message == "User was created."){
            (await this.toastController.create({ message: 'Votre compte a été bien créé', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
            this.submissionType = 'login';
          }
          else if(result.message == "Email address already exists") {
            (await this.toastController.create({ message: 'Cette adresse email est déjà prise par un autre compte', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
          }
        });

      }
    }

  }

  toggleText() {
    if(this.submissionType === 'login') {
      this.submissionType = 'join';
    }
    else if(this.submissionType === 'join') {
      this.submissionType = 'login';
    }
  }

  toggleShowPassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  changeLanguage() {
    this.router.navigate(['/language']);
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    console.log('Items destroyed');
  }

}