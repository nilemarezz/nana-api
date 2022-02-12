const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  client_email,
  private_key,
  shipping_sheet_name_shipping_round,
} = require("../../config/cred");
const moment = require("moment");

exports.getShipRound = async (req, res) => {
  const doc = new GoogleSpreadsheet(process.env.NANA_SHIPPING_SHEET);
  await doc.useServiceAccountAuth({
    client_email: client_email,
    private_key: private_key.replace(new RegExp("\\\\n", "g"), "\n"),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[shipping_sheet_name_shipping_round];
  const rows = await sheet.getRows();
  const data = getShipRoundfromRows(rows);
  res.status(200).send(data);
};

const getShipRoundfromRows = (rows) => {
  let ship_rounds = [];
  for (let i = 0; i < rows.length; i++) {
    ship_rounds.push(moment(rows[i]["รอบเรือ"], "DD/MM/YYYY"));
  }

  ship_rounds = ship_rounds.reverse();

  for (let i = 0; i < ship_rounds.length; i++) {
    ship_rounds[i] = ship_rounds[i].format("DD/MM/YYYY");
  }
  return {
    ship_rounds: ship_rounds.slice(Math.max(ship_rounds.length - 20, 0)),
  };
};
