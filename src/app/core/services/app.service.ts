import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppService {

    API_ENDPOINT = 'http://localhost/jobmap/api/';
    // API_ENDPOINT = 'https://afa9.org//api/';

    constructor(
        private http: HttpClient
    ) { }

    /**
     * get questions array
     */
    get_questionsArray(): any {
        return this.http.get<any>(this.API_ENDPOINT + 'questions/get_questionsArrayMed.php');
    }

    /**
     * get filieres array
     */
    get_filieresArray(): any {
        return this.http.get<any>(this.API_ENDPOINT + 'questions/get_filiereArray.php');
    }

    /**
     * get type bac array
     */
    get_typebacArray(): any {
        return this.http.get<any>(this.API_ENDPOINT + 'questions/get_typebacArray.php');
    }

    /**
     * get niveau formation array
     */
    get_niveauFormationArray(): any {
        return this.http.get<any>(this.API_ENDPOINT + 'questions/get_niveauFormationArray.php');
    }

    /**
     * get metiers
     * @param code_holland the holland code
     * @param id_nf niveau formation id
     */
    getMetiers(code_holland: string, id_nf: number): Observable<any> {
        const body = { code_holland, id_nf };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/get_metiers.php', body);
    }

    /**
     * save score
     * @param scoring the score
     * @param id_codeholland the holland code
     * @param id_utilisateur user id
     */
    saveScore(
        scoring: string, 
        id_codeholland: number, 
        id_utilisateur: number, 
        id_nf: number,
        score_firstletter: number,
        score_secondletter: number,
        score_thirdletter: number,
        score_firststep: string,
        score_secondstep: string,
        score_thirdstep: string,
        score_fourthstep: string): Observable<any> {
        const body = { 
            scoring, 
            id_codeholland, 
            id_utilisateur,
            id_nf,
            score_firstletter,
            score_secondletter,
            score_thirdletter,
            score_firststep,
            score_secondstep,
            score_thirdstep,
            score_fourthstep
        };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/save_score.php', body);
    }

    /**
     * get score
     * @param id_utilisateur the user id
     */
    getScore(id_utilisateur: number): Observable<any> {
        const body = { id_utilisateur };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/get_score.php', body);
    }

    /**
     * get list types bac
     * @param id_metiers the metiers ids
     */
    getMetierTypeBac(id_metiers: number[]): Observable<any> {
        const body = { id_metiers };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/get_metier_typebac.php', body);
    }

    /**
     * get partner score
     * @param adresse_email the partner email address
     */
    getPartnerScore(adresse_email: string): Observable<any> {
        const body = { adresse_email };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/get_partner_score.php', body);
    }

    /**
     * save download info
     */
    resultDownloaded(
        adresse_email: string, 
        id_utilisateur: number, 
        id_codeholland: number, 
        code_hol_compose: string,
        id_nf: number): Observable<any> {
        const body = { 
            adresse_email, 
            id_utilisateur,
            id_codeholland, 
            code_hol_compose,
            id_nf
        };
        return this.http.post<any>(this.API_ENDPOINT + 'resultat/result_downloaded.php', body);
    }

    /**
     * send email
     */
    sendEmail(
        emailTo: string,
        emailSubject: string,
        emailBody: string,
        attachment: string = null
    ): Observable<any> {
        const body = { 
            emailTo, 
            emailSubject,
            emailBody,
            attachment
        };
        return this.http.post<any>(this.API_ENDPOINT + 'sendmail/send_mail.php', body);
    }

}