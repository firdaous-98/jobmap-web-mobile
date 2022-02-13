import { TypeUtilisateur } from "../enums/type-utilisateur.enum";

export interface User {
    id_utilisateur: string,
    id_typeutilisateur: TypeUtilisateur,
    nom: string,
    prenom: string,
    adresse_email: string,
    id_typebac: number,
    id_annee_etude: number
}


export interface UserUpdate {
    id_typeutilisateur: TypeUtilisateur,
    nom: string,
    prenom: string,
    adresse_email: string,
    id_typebac: number,
    id_annee_etude: number,
    jwt: string
}