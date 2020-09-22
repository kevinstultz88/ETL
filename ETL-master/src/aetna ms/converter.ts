import { ETLValidator, ProductionData, Product } from "../etl/types";
import { WorkBook, Sheet } from "xlsx/types";
import xlsx from "xlsx";
import Case from "case";
import { renameKeys } from "../utils/keys";
import RequiredKeysValidator from "../etl/validators.ts/required_keys";
import BaseETLConverter from "../etl/converter";
import { keys } from "ts-transformer-keys";

export default class AetnaMsConverter extends BaseETLConverter<AetnaMsData> {
  protected validators: ETLValidator<AetnaMsDataValidationKeys>[] = [
    new RequiredKeysValidator(keys<AetnaMsDataValidationKeys>()),
  ];

  protected toJson(workBook: WorkBook): AetnaMsData[] {
    var workSheet = workBook.Sheets[workBook.SheetNames[0]];
    const json = xlsx.utils.sheet_to_json(workSheet, {
      raw: false,
    }) as object[];
    return this.mapKeys(json);
  }

  protected toProductionData(
    data: AetnaMsData[]
  ): ProductionData[] | Promise<ProductionData[]> {
    return data 
    .map(
      (record): ProductionData => {
        return {
          state: record.issueState,
          county: "" as string,
          product: record.product,
          writingNumber: record.agentNumber.trim().toString(),
          salesYear: record.effectiveDate.substr( record.effectiveDate.lastIndexOf('/')+1, 4),
          effectiveDate: new Date(record.effectiveDate),
          ytd: 1,
        };
      }
    );
  }

  private mapKeys(data: object[]): AetnaMsData[] {
    return data.map((row) => {
      return renameKeys(Case.camel)(row) as AetnaMsData;
    });
  }
}


// describes the columns we get from the excel file (S3 bucket file)
// for Aetna; only the columns in which we're interested
// type ProductionData (in types.ts) has 7 columns - these are the seven we
// get "naturally" from the UHC model.  Aetna doesn't give salesYear or ytd, 
// nor does it spell any of the others (except effectiveDate) as they're spelled in the production_data table
// So here in the converter derive salesYear from effectiveDate, and set ytd to 1, because in a later step 
// we'll be rolling these detail rows up to aggregate ytd
export interface AetnaMsData {
  effectiveDate: string;
  agentNumber: string;
  issueState: string;
  product: Product;
}

export interface  AetnaMsDataValidationKeys {
  effectiveDate: string;
  agentNumber: string;
  product: string;
}