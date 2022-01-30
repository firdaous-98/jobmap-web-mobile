import { Choix } from "./choix.model";

export class Question {
    Libelle_quest: string;
    Libelle_step: string;
    id_quest: string;
    id_step: string;
    choix: Choix[];
}