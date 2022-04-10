import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AnneeEtudeEnum } from '../core/enums/annee-etude.enum';
import { TypeUtilisateur } from '../core/enums/type-utilisateur.enum';
import { UserHelper } from '../core/helpers/user-helper';
import { NiveauEtude } from '../core/models/filiere.model';
import { NiveauFormation } from '../core/models/niveau-formation.model';
import { TypeBac } from '../core/models/type-bac.model';
import { UserUpdate } from '../core/models/user.model';
import { AccountService } from '../core/services/account.service';
import { AppService } from '../core/services/app.service';
import { TranslatorService } from '../core/services/translate.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage {

  listeNiveauxEtude: NiveauEtude[] = [];
  listeTypesBac: TypeBac[] = [];
  listeNiveauxFormation: NiveauFormation[] = [];
  niveauEtude: string;
  typeUtilisateur: TypeUtilisateur;
  anneeEtude: string;
  typebac: string;
  niveauFormation: string;
  TypeUtilisateur = TypeUtilisateur;
  libelleNiveau: string;
  indexNiveau: number;
  indexAnnee: number;
  isArab: boolean;

  showType = false;
  showNiveau = false;
  showAnnee = false;
  showTypeBac = false;
  showNiveauFormation = false;

  constructor(
    private appSservice: AppService, 
    private accountService: AccountService,
    public toastController: ToastController,
    public translate: TranslateService, 
    public translatorService: TranslatorService,
    private router: Router
    ) {
    this.initFilieres();
    this.showType = true;
   }

  ngOnInit(){
    setTimeout(() => {
      this.translate.use(this.translatorService.getSelectedLanguage());      
    }, 500);
    this.isArab = localStorage.getItem('language') == "ar";
  }

  initFilieres(){
    this.appSservice.get_filieresArray().subscribe((result: NiveauEtude[]) => {
      this.listeNiveauxEtude = result;  
    });
  }

  selectTypeUtilisateur(value: any){
    this.typeUtilisateur = value;
  }

  selectNiveauEtude(value: any) {
    this.niveauEtude = value?.detail?.value;
  }

  selectAnneeEtude(value: any) {
    this.anneeEtude = value?.detail?.value;
  }

  selectTypeBac(value: any) {
    this.typebac = value?.detail?.value;
  }

  selectNiveauFormation(value: any) {
    this.niveauFormation = value?.detail?.value;
  }

  async Choose(){
    if(this.showType) {
      if(this.typeUtilisateur == null){
        (await this.toastController.create({ message: this.translate.instant('PLEASE_CHOOSE'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
        return;
      }
      this.showType = false;
      this.showNiveau = true;
      return;
    }

    if(this.showNiveau){
      if(this.niveauEtude == null){
        (await this.toastController.create({ message: this.translate.instant('PLEASE_CHOOSE'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
        return;
      }
      this.showNiveau = false;
      this.showAnnee = true;
      this.indexNiveau = this.listeNiveauxEtude.findIndex(e => e.id_niveau_etude == this.niveauEtude);
      this.libelleNiveau = this.isArab ? this.listeNiveauxEtude[this.indexNiveau].Libelle_niveau_etude_ar : this.listeNiveauxEtude[this.indexNiveau].Libelle_niveau_etude;
      return;
    }

    if(this.showAnnee){
      if(this.anneeEtude == null){
        (await this.toastController.create({ message: this.translate.instant('PLEASE_CHOOSE'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
        return;
      }
      this.showAnnee = false;

      var indexAnnee = this.listeNiveauxEtude[this.indexNiveau].annees.findIndex(e => e.id_annee_etude == this.anneeEtude);

      if(this.listeNiveauxEtude[this.indexNiveau].annees[indexAnnee].libelle_annee_etude == 'Baccalauréat'){
        this.appSservice.get_typebacArray().subscribe((result: TypeBac[]) => {
          this.listeTypesBac = result;
        });
        this.showTypeBac = true;
      } else {
        this.listeTypesBac = [];
        this.appSservice.get_niveauFormationArray().subscribe((result: NiveauFormation[]) => {
          this.listeNiveauxFormation = result.filter(e => ['M', 'D', 'BAC'].includes(e.libelle_nf));
          if(this.niveauEtude == '3') {
            if([AnneeEtudeEnum.BacPlus1, AnneeEtudeEnum.BacPlus2].includes(parseInt(this.anneeEtude))) {
              var index = this.listeNiveauxFormation.findIndex(e => e.libelle_nf == 'BAC');
              this.listeNiveauxFormation.splice(index, 1);
              this.showNiveauFormation = true;
            } 
            else if ([AnneeEtudeEnum.BacPlus3, AnneeEtudeEnum.BacPlus4, AnneeEtudeEnum.BacPlus5, AnneeEtudeEnum.BacPlus5AndMore].includes(parseInt(this.anneeEtude))) {
              this.niveauFormation = '1';
              this.goToQuiz();
            }
            else {
              this.showNiveauFormation = true;
            }
          }
          else {
            this.showNiveauFormation = true;
          }
        });
        
      }

      return;
    }

    if(this.showTypeBac){
      if(this.typebac == null){
        (await this.toastController.create({ message: this.translate.instant('PLEASE_CHOOSE'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
        return;
      }
      this.showAnnee = false;
      this.showTypeBac = false;
      
      this.appSservice.get_niveauFormationArray().subscribe((result: NiveauFormation[]) => {
        this.listeNiveauxFormation = result.filter(e => ['M', 'D', 'BAC'].includes(e.libelle_nf));
      });
      this.showNiveauFormation = true;
      return;
    }

    if(this.showNiveauFormation) {
      this.goToQuiz();
    }
  }

  backClick(){
    if(this.showType) {
      this.router.navigate(['/home']);
    }
    if(this.showNiveau){
      this.showNiveau = false;
      this.showType = true;
    }
    if(this.showAnnee){
      this.showAnnee = false;
      this.showNiveau = true;
    }

    if(this.showTypeBac){
      this.showTypeBac = false;
      this.showAnnee = true;
    }

    if(this.showNiveauFormation){
      this.showNiveauFormation = false;
      this.listeTypesBac.length > 0 ? this.showTypeBac = true : this.showAnnee = true;
      
    }
  }

  goToQuiz(){
    var tokenInfo = UserHelper.getTokenInfo();
    const user: UserUpdate = {
      nom: tokenInfo.nom,
      prenom: tokenInfo.prenom,
      adresse_email: tokenInfo.adresse_email,
      id_typeutilisateur: this.typeUtilisateur,
      id_typebac: this.typebac != null ? parseInt(this.typebac) : 9,
      id_annee_etude: parseInt(this.anneeEtude),
      jwt: localStorage.getItem('token')
    }

    this.accountService.update(user).subscribe(async result => {
      if(result.status == 'success'){
        (await this.toastController.create({ message: this.translate.instant('INFO_SAVED'), duration: 2500, cssClass: 'app-toast', position: 'bottom', animated: true, mode: 'ios' })).present();
      }
    });

    localStorage.setItem('id_nf', this.niveauFormation);
    localStorage.setItem('id_type_utilisateur', this.typeUtilisateur.toString());
    localStorage.setItem('annee_etude', this.anneeEtude);

    this.router.navigate(['/quiz']);
  }

  getLibelleNiveauFormation(libelle: string) {
    switch(libelle) {
      case 'M':
        return this.translate.instant('BAC_PLUS_FIVE_MORE');
      case 'D':
        return this.translate.instant('BAC_PLUS_TWO_THREE');
      case 'BAC':
        return this.translate.instant('NIVEAU_BAC');
    }
  }
  
}
