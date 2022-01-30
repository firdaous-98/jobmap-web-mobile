import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AppService {

    API_ENDPOINT = 'http://localhost/jobmap/api/questions/';

    constructor(
        private http: HttpClient
    ) { }

    /**
     * get questions array
     */
    get_questionsArray(): any {
        return this.http.get<any>(this.API_ENDPOINT + 'get_questionsArrayMed.php');
    }

}