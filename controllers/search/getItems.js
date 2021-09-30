const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')


exports.getItems = async (req, res) => {
  const twitter = req.params.twitter
  const tel = req.params.tel
  const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
  await doc.useServiceAccountAuth({
    client_email: client_email,
    private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
  const rows = await sheet.getRows();
  const data = await getDataPromise(rows, twitter)
  const sortedData = data.sort((a, b) => (a.release_date_compare > b.release_date_compare) ? 1 : -1)
  const groupedData = await groupDate(sortedData)
  res.json({ success: true, data: groupedData });
}

const getDataPromise = async (rows, account) => {
  const data = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]["@Twitter"] === account) {
      data.push({
        "id": i,
        "shipping_method": rows[i]["ขนส่ง"] || null,
        "product_status": rows[i]["กดสั่งซื้อ"] || null,
        "release_date": rows[i]["เว็บจัดส่งภายในวันที่"] || null,
        "paid_date": rows[i]["จ่ายที่เหลือภายในวันที่"] || null,
        "total2": rows[i]["คงเหลือ"] || null,
        "paid": rows[i]['จ่ายแล้ว'] || null,
        "payment_method": rows[i]['เต็มจำนวน/มัดจำ'] || null,
        "product_pay": rows[i]['รวมราคา'] || null,
        "amount": rows[i]['รวมจำนวนกี่ชิ้น/เซ็ต'] || null,
        "product_name": rows[i]['รายการสั่งซื้อ'] || null,
        "Timestamp": rows[i]['Timestamp'] || null,
        "release_date_compare": Date.parse(rows[i]["เว็บจัดส่งภายในวันที่"]),
        // "date": date,
        "success": true,
      })
    }
  }
  return data;
  // }
  // }
}

const groupDate = (rows) => {
  let group = rows.reduce((r, a) => {
    console.log("a", a);
    console.log('r', r);
    r[a.release_date] = [...r[a.release_date] || [], a];
    return r;
  }, {});
  return group;
}