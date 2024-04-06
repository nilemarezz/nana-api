const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')
exports.createOrder = async (req, res, next) => {
    const body = req.body
    const rowData = []
    body.product.map((item, i) => {
        console.log(item)
        rowData.push({
            "Timestamp": moment().tz("Asia/Bangkok").format('M/D/YYYY HH:MM:SS'),
            "@Twitter": body.account,
            "รายการสั่งซื้อ": item.product_name,
            "รวมจำนวนกี่ชิ้น/เซ็ต": item.product_amount,
            "รวมราคา": item.product_price,
            "เต็มจำนวน/มัดจำ": body.paymentMethod,
            "จ่ายแล้ว": item.product_pay,
            "คงเหลือ": item.product_total2,
            "จ่ายที่เหลือภายในวันที่": (item.paid_date === 'Invalid date' || item.paid_date === '') ? '' : moment(item.paid_date).tz("Asia/Bangkok").format('M/D/YYYY'),
            "เว็บจัดส่งภายในวันที่": (item.release_date === 'Invalid date' || item.release_date === '') ? '' : moment(item.release_date).tz("Asia/Bangkok").format('M/D/YYYY'),
            "ขนส่ง": item.product_shipping_method,
            "กดสั่งซื้อ": item.already_order,
            "ชื่อ-ที่อยู่-เบอร์โทร": body.address,
            "หมายเหตุ": body.caution
        })
    })
    const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
    await doc.useServiceAccountAuth({
        client_email: client_email,
        private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
    await sheet.addRows(rowData)
    res.status(200).json({ success: true })
}
