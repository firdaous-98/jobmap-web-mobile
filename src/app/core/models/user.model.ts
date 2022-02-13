import { TypeUtilisateur } from "../enums/type-utilisateur.enum";

export interface User {
    id_utilisateur: string,
    id_typeutilisateur: TypeUtilisateur,
    nom: string,
    prenom: string,
    adresse_email: string,
    id_typebac: number
}


export interface UserUpdate {
    id_typeutilisateur: TypeUtilisateur,
    nom: string,
    prenom: string,
    adresse_email: string,
    id_typebac: number,
    jwt: string
}