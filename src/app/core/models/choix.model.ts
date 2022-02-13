import { CodeHolland } from "../enums/code-holland.enum";

export interface Choix {
    id: string;
    libellechoix: string;
    code_holland: string;
}

export interface ResultChoix {
    id: string;
    code_holland: CodeHolland;
}