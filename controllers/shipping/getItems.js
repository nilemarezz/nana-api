const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  client_email,
  private_key,
  shipping_sheet_name,
} = require("../../config/cred");
const moment = require("moment");

exports.getItems = async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const doc = new GoogleSpreadsheet(process.env.NANA_SHIPPING_SHEET);
    await doc.useServiceAccountAuth({
      client_email: client_email,
      private_key: private_key.replace(new RegExp("\\\\n", "g"), "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[shipping_sheet_name];
    const rows = await sheet.getRows();
    const data = getRowByAccountId(rows, accountId);

    res.status(200).send({ success: true, data: { ...data } });
  } catch (err) {
    console.log(err);
    res.status(200).send({ success: false });
  }
};

const getRowByAccountId = (rows, accountId) => {
  let items = [];
  let ship_rounds = [];

  for (let i = 0; i < rows.length; i++) {
    if (
      rows[i]["Twitter"].replace(/\s+/g, "").toLowerCase() ===
      accountId.replace(/\s+/g, "").toLowerCase()
    ) {
      const data = rows[i];
      items.push({
        twitter: data["Twitter"],
        tracking: data["เลขแทรกกิ้ง"],
        product_name: data["คำอธิบายพัสดุ"],
        price: data["ราคา(JPY)"],
        image: data["รูปภาพสินค้า (ถ้ามี)"] || "",
        ship_round: data["รอบเรือ"] || "",
        product_status: data["น้ำหนักสินค้า"] || "",
        product_weight: data["สถานะสินค้า"] || "",
        tracking_th: data["Tracking no. ในไทย"] || "",
        moment_ship_round:
          data["รอบเรือ"] === undefined
            ? ""
            : moment(data["รอบเรือ"], "DD/MM/YYYY"),
      });
      ship_rounds.push(data["รอบเรือ"] || "");
    }
  }
  let format_ship_date = sortShippingDate(ship_rounds);
  let data = sortedData(items);
  return { items: data, ship_rounds: format_ship_date };
};

const sortedData = (items) => {
  let emptyShipdate = [];
  let notEmptyShipDate = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].moment_ship_round === "") {
      emptyShipdate.push(items[i]);
    } else {
      notEmptyShipDate.push(items[i]);
    }
  }
  return [...emptyShipdate, ...notEmptyShipDate.reverse()];
};

const sortShippingDate = (ship_rounds) => {
  let format_ship_date = [];
  for (let i = 0; i < ship_rounds.length; i++) {
    if (ship_rounds[i] !== "") {
      format_ship_date.push(moment(ship_rounds[i], "DD/MM/YYYY"));
    }
  }
  format_ship_date = format_ship_date.reverse();
  for (let i = 0; i < format_ship_date.length; i++) {
    format_ship_date[i] = format_ship_date[i].format("DD/MM/YYYY");
  }

  if (ship_rounds.includes("")) {
    format_ship_date = ["", ...format_ship_date];
  }
  return [...new Set(format_ship_date)];
};
