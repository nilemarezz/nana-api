const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
exports.getItems = async (req, res) => {
  try {
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
    if (data.length === 0) {
      console.log("data not found - " + twitter)
      res.json({ success: true, data: [] });
    } else {
      console.log(`data found - ${data.length} items , ${twitter}`)
      const sortedData = data.sort((a, b) => (b.release_date_compare > a.release_date_compare) ? 1 : -1)
      const groupedData = await groupDate(sortedData)
      const resData = []
      Object.keys(groupedData).map((key) => {
        // let item = {key : null , value : null}
        // item[key] = [...groupedData[key]];
        resData.push({ key: key, value: [...groupedData[key]] })
      });
      console.log("Success")
      res.json({ success: true, data: resData });
    }
  } catch (err) {
    console.log(err)
    res.json({ success: false, code: "BE-eer" });
  }
}

const getDataPromise = async (rows, account) => {
  const data = [];
  // console.log(account.replace(/\s+/g, '').toLowerCase())
  for (let i = 0; i < rows.length; i++) {
    console.log(rows[i]["@Twitter"])
    if (rows[i]["@Twitter"].replace(/\s+/g, '').toLowerCase() === account.replace(/\s+/g, '').toLowerCase()) {

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
        "release_date_format": `${monthNames[new Date(rows[i]["เว็บจัดส่งภายในวันที่"]).getMonth()]} ${new Date(rows[i]["เว็บจัดส่งภายในวันที่"]).getFullYear()}`,
        "release_date_compare": Date.parse(rows[i]["เว็บจัดส่งภายในวันที่"]),
        "tracking_no": rows[i]['เลข Tracking'] || null,
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
    r[a.release_date_format] = [...r[a.release_date_format] || [], a];
    return r;
  }, {});
  return group;
}
