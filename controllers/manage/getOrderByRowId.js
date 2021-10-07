const { GoogleSpreadsheet } = require('google-spreadsheet');
// const { getSheetsId } = require('../../helpers/getSheetId')
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')

exports.getOrderById = async (req, res, next) => {
  try {
    console.log(moment().tz("Asia/Bangkok").toString(), ` - getOrderById ,row:${parseInt(req.params.id) + 1}`)
    const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
    await doc.useServiceAccountAuth({
      client_email: client_email,
      private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
    const rows = await sheet.getRows();
    const index = parseInt(req.params.id) + 1
    const data = {
      "id": index,
      "twitter": rows[index]["@Twitter"] || null,
      "product_name": rows[index]['รายการสั่งซื้อ'] || null,
      "amount": rows[index]['รวมจำนวนกี่ชิ้น/เซ็ต'] || null,
      "total_amount": rows[index]['รวมราคา'] || null,
      "payment_method": rows[index]['เต็มจำนวน/มัดจำ'] || null,
      "already_paid": rows[index]['จ่ายแล้ว'] || null,
      "total2": rows[index]["คงเหลือ"] || null,
      "paid_date": rows[index]["จ่ายที่เหลือภายในวันที่"] || null,
      "release_date": rows[index]["เว็บจัดส่งภายในวันที่"] || null,
      "shipping_method": rows[index]["ขนส่ง"] || null,
      "product_status": rows[index]["กดสั่งซื้อ"] || null,
      "address": rows[index]['ชื่อ-ที่อยู่-เบอร์โทร'] || null,
      "caution": rows[index]['หมายเหตุ'] || null,
      "tracking_no": rows[index]['เลข Tracking'] || null,
    }

    await res.status(200).json({ success: true, data: data });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, code: err.response ? err.response.status : 405 });
  }
}
