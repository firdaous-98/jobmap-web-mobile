import { CodeHolland } from "../enums/code-holland.enum";

export interface Reponse {
    id_quest: string;
    code_holland: CodeHolland | CodeHolland[];
}

export interface Scores {
    totalR: number,
    totalI: number,
    totalA: number,
    totalS: number,
    totalE: number,
    totalC: number
}