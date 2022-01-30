import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    API_ENDPOINT = 'http://localhost/jobmap/api/authentication/';

    constructor(
        private http: HttpClient
    ) { }

    /**
     * Login
     * @param adresse_email the user email address
     * @param motdepasse the user password
     */
    login(adresse_email: string, motdepasse: string): Observable<any> {
        const bodyLogin = { adresse_email, motdepasse };
        return this.http.post<any>(this.API_ENDPOINT + 'login.php', bodyLogin);
    }

    /**
     * Sign in
     * @param nom user last name
     * @param prenom user first name
     * @param adresse_email the user email address
     * @param motdepasse the user password
     */
    signin(nom: string, prenom: string, adresse_email: string, motdepasse: string): Observable<any> {
        const bodyLogin = { nom, prenom, adresse_email, motdepasse };
        return this.http.post<any>(this.API_ENDPOINT + 'create_user.php', bodyLogin);
    }
}