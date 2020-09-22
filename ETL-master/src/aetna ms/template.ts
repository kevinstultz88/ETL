import { BaseETLTemplate } from "../etl/template";
import { ETLConverter } from "../etl/types";
import AetnaMsConverter from "./converter";

export default class AetnaMsTemplate extends BaseETLTemplate {
  public carrierName: string = "AetnaMs";
  protected carrierId: number = 3;
  protected converters: ETLConverter[] = [new AetnaMsConverter()];
}