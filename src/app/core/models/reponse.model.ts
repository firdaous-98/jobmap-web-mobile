import { CodeHolland } from "../enums/code-holland.enum";
import { ResultChoix } from "./choix.model";

export interface Reponse {
    id_quest: string;
    code_holland: CodeHolland | ResultChoix[];
}

export interface Scores {
    totalR: number,
    totalI: number,
    totalA: number,
    totalS: number,
    totalE: number,
    totalC: number
}