import { BaseETLTemplate } from "../etl/template";
import { ETLConverter } from "../etl/types";
import AnthemConverter from "./converter";

export default class AnthemTemplate extends BaseETLTemplate {
  public carrierName: string = "Anthem";
  protected carrierId: number = 103;
  protected converters: ETLConverter[] = [new AnthemConverter()];
}