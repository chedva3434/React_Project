
import { Instructions } from "./instructions";
import {Ingrident}  from "./ingrident";
export type Rec = {
    Ingredients: unknown;
    Id: number;
    Name: string;
    Img: string;
    Duration: number;
    Difficulty: number;
    Description: string;
    Categoryid : string;
    Instructions: Instructions[];  
    Ingridents:  Ingrident[]; 
    UserId:number
};
