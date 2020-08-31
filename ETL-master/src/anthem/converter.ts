import { ETLValidator, ProductionData, Product } from "../etl/types";
import { WorkBook, Sheet } from "xlsx/types";
import xlsx from "xlsx";
import { DateTime } from "luxon";
import R, { length } from "ramda";
import Case from "case";
import { renameKeys } from "../utils/keys";
import RequiredKeysValidator from "../etl/validators.ts/required_keys";
import BaseETLConverter from "../etl/converter";
import { keys } from "ts-transformer-keys";

export default class AnthemConverter extends BaseETLConverter<AnthemData> {
  protected validators: ETLValidator<AnthemDataValidationKeys>[] = [
    new RequiredKeysValidator(keys<AnthemDataValidationKeys>()),
  ];

  protected toJson(workBook: WorkBook): AnthemData[] {

    let arrAnthemData: any[] = [];
    let  checkNames: String | undefined;
    let wIdx: number;
    wIdx = 0;
    checkNames = workBook.SheetNames[wIdx];
    while (checkNames != undefined) {
        checkNames = workBook.SheetNames[wIdx];

    if(checkNames == "MA_2020" || checkNames == "MS_2020") {
        var workSheet = workBook.Sheets[workBook.SheetNames[wIdx]];
        var json = xlsx.utils.sheet_to_json(workSheet, {
          raw: false,
        }) as object[];

        arrAnthemData.push(this.mapKeys(json));
      }
        wIdx++;
        
    }
     
    let arrAnthemJson: any[] = [];  
    arrAnthemData.forEach((value) =>  arrAnthemJson=arrAnthemJson.concat(value));
    return arrAnthemJson;
  }

  // filter acts like WHERE; map acts like coluimn list; reduce acts like aggregator
  protected toProductionData(
    data: AnthemData[]
  ): ProductionData[] | Promise<ProductionData[]> {
    return  data
    .filter( record => { 
            if(
            record.productType == "MA" && record.changeType == "New App" && record.enrollmentStatus == "Enrolled" && record.statusReason == "Active Enrollment" && (record.productTypeDescription == "MAPD" || record.productTypeDescription == "MA") )
            {
                return true;
            } else if(record.productType == "MS" && record.changeType == "New App" && record.enrollmentStatus == "Enrolled") {
                return true;
            } else if(record.productTypeDescription == "PDP" && record.changeType == "New App" && record.enrollmentStatus == "Enrolled" && record.statusReason == "Active Enrollment") {
                return true;
            }
            return false;
    })
    .map(
    (record): ProductionData => {
        let product: Product;
        if (record.productType.includes("MS")) {
            product = "Med Supp";
          } else if (record.productTypeDescription == "PDP") {
            product = record.productTypeDescription
          } else {
            product = record.productType as Product;
          }
        // ...R.pick() spreads record object and returns these two keys (columns) without changing them
        return {
            ...R.pick(
                ["state", "county"],  
                record
            ),
            product,
            writingNumber: record.agentEncryptedTIN,
            salesYear: record.effectiveDate.substr( record.effectiveDate.lastIndexOf('/')+1, 4),
            effectiveDate: new Date(record.effectiveDate),
            ytd: 1,
        };
    }
    );
  }

  private mapKeys(data: object[]): AnthemData[] {
    return data.map((row) => {
      return renameKeys(Case.camel)(row) as AnthemData;
    });
  }
}

// describes the columns we get from the excel file (S3 bucket file)
// for Anthem; only the columns in which we're interested
// type ProductionData (in types.ts) has 7 columns - these are the seven we
// get "naturally" from the UHC model.  Anthem doesn't give salesYear or ytd.
// So here in the converter we have to re-spell Effective Date to effectiveDate,
// derive salesYear from effectiveDate, and set ytd to 1, because in a later step 
// we'll be rolling these detail rows up to aggregate ytd; UHC is the only 
// carrier who has that column already aggregated for us.
 //changeType = "New App"; enrollmentStatus = "Enrolled"; statusReason="Active Enrollment"; productTypeDescription="MAPD"
export interface AnthemData {
  effectiveDate: string;
  agentEncryptedTIN: string;
  state: string;
  county: string;
  productType : string;

  productTypeDescription: string;
  changeType: string;
  enrollmentStatus: string;
  statusReason: string;  
}

export interface  AnthemDataValidationKeys {

  effectiveDate: string;
  agentEncryptedTIN: string;
  state: string;
  county: string;
  productTypeDescription: string;

}