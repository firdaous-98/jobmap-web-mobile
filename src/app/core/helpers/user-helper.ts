import { JwtHelperService } from "@auth0/angular-jwt";
import { TokenInfo } from "../models/token.model";

export class UserHelper {

    static getTokenInfo(): TokenInfo {
        const token = localStorage.getItem('token');
        
        const helper = new JwtHelperService();
        const tokenInfo = UserHelper.mapTokenToTokenInfo(helper.decodeToken(token));
        return tokenInfo;      
    }

    private static mapTokenToTokenInfo(token: any): TokenInfo {
        debugger
        return {
            id_utilisateur: token.data.id_utilisateur,
            nom: token.data.nom,
            prenom: token.data.prenom,
            adresse_email: token.data.adresse_email,
            id_typeutilisateur: token.data.id_typeutilisateur,
            id_annee_etude: token.data.id_annee_etude
        };
    }
        
}