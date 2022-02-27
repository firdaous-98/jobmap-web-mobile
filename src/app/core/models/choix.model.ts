import { CodeHolland } from "../enums/code-holland.enum";

export interface Choix {
    id: string;
    libellechoix: string;
    choix_ar: string;
    code_holland: string;
}

export interface ResultChoix {
    id: string;
    code_holland: CodeHolland;
}