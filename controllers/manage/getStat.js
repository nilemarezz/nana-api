const { GoogleSpreadsheet } = require('google-spreadsheet');
// const { getSheetsId } = require('../../helpers/getSheetId')
const { client_email, private_key } = require('../../config/cred')
const moment = require('moment-timezone')

exports.getStat = async (req, res, next) => {
    // const shop = "catchy_kr"
    const date = req.params.date
    // console.log(moment().tz("Asia/Bangkok").toString(), ` - getOrders ${date},${shop}`)
    const doc = new GoogleSpreadsheet(process.env.NANA_SHEET);
    await doc.useServiceAccountAuth({
        client_email: client_email,
        private_key: private_key.replace(new RegExp("\\\\n", "\g"), "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["รวมทั้งหมด"];
    const rows = await sheet.getRows();
    let headerSummary = {
        total2: 0,
        count: 1,
        product_pay: 0
    }

    let shippingMethodStat = [
        {
            type: 'ลทบ',
            count: 0,
        },
        {
            type: 'ยังไม่ได้เก็บ',
            count: 0,
        },
        {
            type: 'ems',
            count: 0,
        }, {
            type: 'no data',
            count: 0,
        },
    ];

    let paymentMethodStat = [
        {
            type: 'เต็มจำนวน',
            count: 0,
        },
        {
            type: 'มัดจำ+ที่เหลือ',
            count: 0,
        },
        {
            type: 'มัดจำ',
            count: 0,
        },
        {
            type: 'no data',
            count: 0,
        }
    ]
    // const allRows = rows.length
    // headerSummary.count = allRows
    const countAccount = {}
    const countProduct = {}
    const payMonth = {}
    const total2Month = {}

    if (date === "all") {
        headerSummary = await getAllData(rows, headerSummary, shippingMethodStat, paymentMethodStat, countAccount, countProduct, payMonth, total2Month)
    } else {
        headerSummary = await getDataByMonth(rows, headerSummary, shippingMethodStat, paymentMethodStat, countAccount, countProduct, payMonth, total2Month, date)
    }

    res.status(200).json({
        success: true, data: {
            ...headerSummary
        }
    });
}


const getAllData = (rows, headerSummary, shippingMethodStat, paymentMethodStat, countAccount, countProduct, payMonth, total2Month) => {
    for (let i = 0; i < rows.length; i++) {
        console.log(rows[i]['Timestamp'][1200])
        if (rows[i]['Timestamp']) {
            // top summary
            headerSummary.total2 += parseFloat(rows[i]['คงเหลือ'] || 0) || 0;
            headerSummary.product_pay += parseFloat(rows[i]['รวมราคา'] || 0) || 0;
            headerSummary.count += 1
            // shippingMethodStat
            shippingMethodStat[getShippingMethodIndex(rows[i]['ขนส่ง'] || "no data")].count += 1

            paymentMethodStat[getPaymentMethodIndex(rows[i]['เต็มจำนวน/มัดจำ'] || "no data")].count += 1
            countAccount[rows[i]['@Twitter']] = (countAccount[rows[i]['@Twitter']] || 0) + (parseFloat(rows[i]['รวมราคา'] || 0))
            countProduct[rows[i]['รายการสั่งซื้อ']] = (countProduct[rows[i]['รายการสั่งซื้อ']] || 0) + 1
            payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] = (payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] || 0) + (parseFloat(rows[i]['รวมราคา'] || 0))
            // payMonth[rows[i]['order_id'].substring(1, 3)] = (payMonth[rows[i]['order_id'].substring(1, 3)] || 0) + (parseFloat(rows[i]['ยอดที่โอน'] || 0))
            // total2Month[rows[i]['order_id'].substring(1, 3)] = (total2Month[rows[i]['order_id'].substring(1, 3)] || 0) + (parseFloat(rows[i]['ยอดมัดจำที่เหลือ'] || 0))
            total2Month[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] = (payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] || 0) + (parseFloat(rows[i]['คงเหลือ'] || 0))
        }
    }
    const countTopAccount = getTopAccount(countAccount)
    const countTopProduct = getTopProduct(countProduct)
    const monthPay = formatMonthData(payMonth)
    const monthTotal2 = formatMonthData(total2Month)
    return { headerSummary, shippingMethodStat, paymentMethodStat, countTopAccount, countTopProduct, monthPay, monthTotal2 };
}

const getDataByMonth = (rows, headerSummary, shippingMethodStat, paymentMethodStat, countAccount, countProduct, payMonth, total2Month, date) => {
    const month = moment(date, "M_YYYY").month() + 1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i]['Timestamp']) {
            if (month === moment(rows[i]["Timestamp"], "M/D/YYYY").month() + 1) {
                headerSummary.total2 += parseFloat(rows[i]['คงเหลือ'] || 0) || 0;
                headerSummary.product_pay += parseFloat(rows[i]['รวมราคา'] || 0) || 0;
                headerSummary.count += 1

                shippingMethodStat[getShippingMethodIndex(rows[i]['ขนส่ง'] || "no data")].count += 1
                paymentMethodStat[getPaymentMethodIndex(rows[i]['เต็มจำนวน/มัดจำ' || "no data"])].count += 1
                countAccount[rows[i]['@Twitter']] = (countAccount[rows[i]['@Twitter']] || 0) + (parseFloat(rows[i]['รวมราคา'] || 0))
                countProduct[rows[i]['รายการสั่งซื้อ']] = (countProduct[rows[i]['รายการสั่งซื้อ']] || 0) + 1
                payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] = (payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] || 0) + (parseFloat(rows[i]['รวมราคา'] || 0))
                total2Month[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] = (payMonth[moment(rows[i]["Timestamp"], "M/D/YYYY").date()] || 0) + (parseFloat(rows[i]['คงเหลือ'] || 0))
            }
        }
    }
    const countTopAccount = getTopAccount(countAccount)
    const countTopProduct = getTopProduct(countProduct)
    const monthPay = formatMonthData(payMonth)
    const monthTotal2 = formatMonthData(total2Month)
    return { headerSummary, shippingMethodStat, paymentMethodStat, countTopAccount, countTopProduct, monthPay, monthTotal2 }
}

const getShippingMethodIndex = (method) => {
    if (method === "ลทบ") {
        return 0
    } else if (method === "ยังไม่ได้เก็บ") {
        return 1
    } else if (method === "ems") {
        return 2
    } else if (method === "no data") {
        return 3
    }
}

const getPaymentMethodIndex = (method) => {
    if (method === "เต็มจำนวน") {
        return 0
    } else if (method === "มัดจำ+ที่เหลือ") {
        return 1
    } else if (method === "มัดจำ") {
        return 2
    } else {
        return 3
    }
}

const getTopAccount = (countAccount) => {
    var sortablecountAccount = [];
    for (var item in countAccount) {
        sortablecountAccount.push([item, countAccount[item]]);
    }

    sortablecountAccount.sort(function (a, b) {
        return b[1] - a[1];
    })
    let sliceArr = sortablecountAccount.splice(0, 5);
    let data = [];
    for (let i = 0; i < sliceArr.length; i++) {
        data.push({ Account: sliceArr[i][0], count: sliceArr[i][1] })
    }
    return data
}

const getTopProduct = (countProduct) => {
    var sortablecountAccount = [];
    for (var item in countProduct) {
        sortablecountAccount.push([item, countProduct[item]]);
    }

    sortablecountAccount.sort(function (a, b) {
        return b[1] - a[1];
    })
    let sliceArr = sortablecountAccount.splice(0, 5);
    let data = [];
    for (let i = 0; i < sliceArr.length; i++) {
        data.push({ Product: sliceArr[i][0], count: sliceArr[i][1] })
    }
    return data
}

const formatMonthData = (month) => {
    var monthFormat = [];
    for (var item in month) {
        monthFormat.push({ month: item, total: month[item] });
    }
    monthFormat.sort(function (a, b) {
        return a["month"] - b["month"];
    })
    return monthFormat
}