import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserUpdate } from "../models/user.model";

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    // API_ENDPOINT = 'http://localhost/jobmap/api/authentication/';
    API_ENDPOINT = 'https://afa9.org/api/authentication/';

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
     * @param numero_telephone the user phone number
     * @param motdepasse the user password
     */
    signin(
        nom: string, 
        prenom: string, 
        numero_telephone: string, 
        adresse_email: string, 
        motdepasse: string): Observable<any> {
        const bodyLogin = { nom, prenom, numero_telephone, adresse_email, motdepasse };
        return this.http.post<any>(this.API_ENDPOINT + 'create_user.php', bodyLogin);
    }

    /**
     * Update user
     * @param user user to update
     */
    update(user: UserUpdate): Observable<any> {
        return this.http.post<any>(this.API_ENDPOINT + 'update_user.php', user);
    }

}