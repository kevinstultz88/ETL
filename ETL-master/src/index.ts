import UHCTemplate from "./uhc/template";
import HumanaTemplate from "./humana/template";
import AetnaTemplate from "./aetna/template";
import AetnaMsTemplate from "./aetna ms/template";
import ScanTemplate from "./scan/template";
import AnthemTemplate from "./anthem/template";

import DBClient from "./db/client";
import config from "./config";
import AWSClient from "./aws/client";

const db = new DBClient(
  config.db.host,
  config.db.user,
  config.db.password,
  config.db.database
);

const aws = new AWSClient(
  config.aws.region,
  config.aws.accessKeyId,
  config.aws.secretAccessKey,
);

const uhc = new UHCTemplate(db, aws, config.aws.bucket);
const humana = new HumanaTemplate(db, aws, config.aws.bucket);
const aetna = new AetnaTemplate(db, aws, config.aws.bucket);
const aetnams = new AetnaMsTemplate(db, aws, config.aws.bucket);
const scan = new ScanTemplate(db, aws, config.aws.bucket);
const anthem = new AnthemTemplate(db, aws, config.aws.bucket);

export const etl = async () => {
    await uhc.run();
    await humana.run();
    await aetna.run();
    await aetnams.run();
    await scan.run();
    await anthem.run();
};

etl();