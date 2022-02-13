import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AccountService } from '../core/services/account.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastController } from '@ionic/angular';

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
    private router: Router,
    public toastController: ToastController
    ) { }

  ngOnInit() {
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
              (await this.toastController.create({ message: 'Votre token est expirée', duration: 2500, position: 'bottom', animated: true, mode: 'ios' })).present();
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

}