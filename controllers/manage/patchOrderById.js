const { GoogleSpreadsheet } = require('google-spreadsheet');
// const { getSheetsId } = require('../../helpers/getSheetId')
// const { getSheetUserId } = require('../../helpers/getSheetUserId')
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')
exports.patchOrderById = async (req, res, next) => {
    console.log("patch", req.params.id)
    const id = req.params.id;
    const data = req.body;
    try {
        const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
        await doc.useServiceAccountAuth({
            client_email: client_email,
            private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
        const rows = await sheet.getRows();
        rows[id]['@Twitter'] = data.twitter,
            rows[id]['รายการสั่งซื้อ'] = data.product_name,
            rows[id]['รวมจำนวนกี่ชิ้น/เซ็ต'] = data.amount,
            rows[id]['รวมราคา'] = data.total_amount,
            rows[id]['เต็มจำนวน/มัดจำ'] = data.payment_method,
            rows[id]['จ่ายแล้ว'] = data.already_paid
        rows[id]['คงเหลือ'] = data.total2
        rows[id]['จ่ายที่เหลือภายในวันที่'] = data.paid_date || ''
        rows[id]['เว็บจัดส่งภายในวันที่'] = data.release_date
        rows[id]['ขนส่ง'] = data.shipping_method
        rows[id]['กดสั่งซื้อ'] = data.product_status
        rows[id]['ชื่อ-ที่อยู่-เบอร์โทร'] = data.address,
            rows[id]['หมายเหตุ'] = data.caution || ''
        rows[id]['เลข Tracking'] = data.tracking_no || ''
        await rows[id].save();
        // await patchOrderById(date, shop, data, id)
        res.status(200).json({ success: true, method: 'patch orders ' + req.params.id });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, code: err.response ? err.response.status : 405 });
    }
}


    // const patchOrderById = async (date, shop, data, id) => {
    //     try {
    //         const sheetId = getSheetUserId(shop)
    //         const doc = new GoogleSpreadsheet(sheetId);
    //         await doc.useServiceAccountAuth({
    //             client_email: client_email,
    //             private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
    //         });
    //         await doc.loadInfo();
    //         const sheet = doc.sheetsByTitle[date];
    //         const rows = await sheet.getRows();
    //         rows[id]['Tracking no.'] = data.tracking_no,
    //             rows[id]['สถานะการจ่ายเงิน'] = data.payment_status,
    //             rows[id]['รายการ'] = data.product_name,
    //             rows[id]['จำนวน'] = data.amount,
    //             rows[id]['การจัดส่ง'] = data.shipping_method,
    //             rows[id]['สถานะสินค้า'] = data.product_status
    //         await rows[id].save();
    //     } catch (err) {
    //         console.log(err)
    //     }
//     res.status(200).json({ success: true, method: 'patch orders ' + req.params.id });
// }
