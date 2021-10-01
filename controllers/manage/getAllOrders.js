const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')

exports.getAllOrders = async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
    await doc.useServiceAccountAuth({
      client_email: client_email,
      private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
    const rows = await sheet.getRows();
    const data = []
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]["Timestamp"]) {
        data.push({
          "id": i,
          // "order_id": rows[i]["order_id"] || null,
          "twitter": rows[i]["@Twitter"] || null,
          "product_name": rows[i]['รายการสั่งซื้อ'] || null,
          "amount": rows[i]['รวมจำนวนกี่ชิ้น/เซ็ต'] || null,
          "product_status": rows[i]['กดสั่งซื้อ'] || null,
          "payment_status": rows[i]['เต็มจำนวน/มัดจำ'] || null,
          "timestamp": rows[i]["Timestamp"],
          "timestamp_parse": Date.parse(rows[i]["Timestamp"])
          // "image_link": rows[i]['image_link'] || null,
          // "total2": rows[i]['ยอดมัดจำที่เหลือ'] || null,
        })
      }
    }
    console.log(data.length)
    const sortedData = data.sort((a, b) => (b.timestamp_parse > a.timestamp_parse) ? 1 : -1)
    res.status(200).json({ success: true, data: sortedData });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, code: err.response ? err.response.status : 405 });
  }
}