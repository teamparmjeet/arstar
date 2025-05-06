const md5 = require("md5");
const connection = require("../config/connectDB");
require('dotenv').config();

const homePage = async (req, res) => {
    // const [settings] = await connection.query('SELECT `app` FROM admin');
    // let app = settings[0].app;
    return res.render("home/index.ejs");
}

const activityPage = async (req, res) => {
    return res.render("activity/index.ejs");
}
const checkInPage = async (req, res) => {
    return res.render("checkIn/checkIn.ejs");
}




const checkDes = async (req, res) => {
    return res.render("checkIn/checkDes.ejs");
}

const checkRecord = async (req, res) => {
    return res.render("checkIn/checkRecord.ejs");
}

const addBank = async (req, res) => {
    return res.render("wallet/addbank.ejs");
}

// promotion
const promotionPage = async (req, res) => {
    return res.render("promotion/promotion.ejs");
}

const promotionmyTeamPage = async (req, res) => {
    return res.render("promotion/myTeam.ejs");
}

const promotionDesPage = async (req, res) => {
    return res.render("promotion/promotionDes.ejs");
}

const tutorialPage = async (req, res) => {
    return res.render("promotion/tutorial.ejs");
}

const bonusRecordPage = async (req, res) => {
    return res.render("promotion/bonusrecord.ejs");
}

// currency page

const currencyPage = async(req, res) => {
    return res.render('wallet/currency.ejs')
}

// wallet
const walletPage = async (req, res) => {
    return res.render("wallet/index.ejs");
}

const rechargePage = async (req, res) => {
    return res.render("wallet/recharge.ejs");
}
const rechargePageUSDT = async (req, res) => {
    return res.render("wallet/rechargeUSDT.ejs");
}

const rechargeDepositPage = async (req, res) => {
    const [bank_recharge] = await connection.query('SELECT * FROM bank_recharge where type="upi"');
    const upiData = bank_recharge[0];
    return res.render("wallet/utr-recharge.ejs", { upiData });
}
const rechargeDepositPageUSDT = async (req, res) => {
    const [bank_recharge] = await connection.query('SELECT * FROM bank_recharge where type="upi_usdt"');
    // const upiData = bank_recharge[0];
    const upiData = {str : "", qr_file : ""}
    upiData.str = "0x6084979039154e0b5de6e9b3db79daf0387e62c7"
    upiData.qr_file = "qr_usdt.jpeg"
    return res.render("wallet/utr-recharge-usdt.ejs", { upiData });
}


const rechargeDepositPost = async (req, res) => {
    const date = new Date();


    let now = new Date().getTime();
    let { utrno, amount } = req.body;
    if (!utrno || !amount) {
        return res.status(200).json({
            message: 'ERROR!!! Missing required fileds',
            status: false
        });
    }

    function formateT(params) {
        let result = (params < 10) ? "0" + params : params;
        return result;
    }

    function timerJoin(params = '', addHours = 0) {
        let date = '';
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }

        date.setHours(date.getHours() + addHours);

        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());

        let hours = date.getHours() % 12;
        hours = hours === 0 ? 12 : hours;
        let ampm = date.getHours() < 12 ? "AM" : "PM";

        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());

        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    let time = new Date().getTime();
    let checkTime = timerJoin(time);
    let id_time = date.getUTCFullYear() + '' + date.getUTCMonth() + 1 + '' + date.getUTCDate();
    let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    let client_transaction_id = id_time + id_order;

    let auth = req.cookies.auth;

    try {
        const [userDetails] = await connection.query('SELECT * FROM users WHERE `token` = ? ', [auth]);
        if (!userDetails) {
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
        }

        const [check_utr_no] = await connection.query('SELECT * FROM recharge WHERE utr = ?', [utrno]);

        if (check_utr_no.length == 1) {
            return res.status(200).json({
                message: 'UTR is already exist.',
                status: false
            });
        } else {
            let userInfo = userDetails[0];
            let amountData = Number(amount);

            const sql = "INSERT INTO recharge SET id_order = ?,transaction_id = ?,utr = ?, phone = ?, money = ?,type = ?, status = ?,today = ?,time = ?";
            await connection.execute(sql, [client_transaction_id, 0, utrno, userInfo.phone, amountData, 'upi', 0, checkTime, time]);

            return res.status(200).json({
                message: "Request generated successfully",
                status: true
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }
}
const rechargeDepositPostUSDT = async (req, res) => {
    const date = new Date();


    let now = new Date().getTime();
    let { utrno, amount } = req.body;

    amount = amount * 93 // udt to inr
    if (!utrno || !amount) {
        return res.status(200).json({
            message: 'ERROR!!! Missing required fileds',
            status: false
        });
    }

    function formateT(params) {
        let result = (params < 10) ? "0" + params : params;
        return result;
    }

    function timerJoin(params = '', addHours = 0) {
        let date = '';
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }

        date.setHours(date.getHours() + addHours);

        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());

        let hours = date.getHours() % 12;
        hours = hours === 0 ? 12 : hours;
        let ampm = date.getHours() < 12 ? "AM" : "PM";

        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());

        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    let checkTime = timerJoin(time);
    let id_time = date.getUTCFullYear() + '' + date.getUTCMonth() + 1 + '' + date.getUTCDate();
    let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    let client_transaction_id = id_time + id_order;
    let time = new Date().getTime();

    let auth = req.cookies.auth;

    try {
        const [userDetails] = await connection.query('SELECT * FROM users WHERE `token` = ? ', [auth]);
        if (!userDetails) {
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
        }

        const [check_utr_no] = await connection.query('SELECT * FROM recharge WHERE utr = ?', [utrno]);

        if (check_utr_no.length == 1) {
            return res.status(200).json({
                message: 'UTR is already exist.',
                status: false
            });
        } else {
            let userInfo = userDetails[0];
            let amountData = Number(amount);

            const sql = "INSERT INTO recharge SET id_order = ?,transaction_id = ?,utr = ?, phone = ?, money = ?,type = ?, status = ?,today = ?,time = ?, currency = ?";
            await connection.execute(sql, [client_transaction_id, 0, utrno, userInfo.phone, amountData, 'upi', 0, checkTime, time, "usdt"]);

            return res.status(200).json({
                message: "Request generated successfully",
                status: true
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }
}

const rechargerecordPage = async (req, res) => {
    return res.render("wallet/rechargerecord.ejs");
}

const withdrawalPage = async (req, res) => {
    return res.render("wallet/withdrawal.ejs");
}

const withdrawalrecordPage = async (req, res) => {
    return res.render("wallet/withdrawalrecord.ejs");
}
const referralWithdrowPage = async (req, res) => {
    return res.render("wallet/referralWithdrow.ejs");
}

const transfer = async (req, res) => {
    return res.render("wallet/transfer.ejs");
}
 
const referralWithdrowrecordpage= async (req, res) => {
    return res.render("wallet/referralWithdrowrecord.ejs");
}


// member page
const mianPage = async (req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `level` FROM users WHERE `token` = ? ', [auth]);
    const [settings] = await connection.query('SELECT `cskh` FROM admin');
    let cskh = settings[0].cskh;
    let level = user[0].level;
    return res.render("member/index.ejs", { level, cskh });
}
const aboutPage = async (req, res) => {
    return res.render("member/about/index.ejs");
}

const recordsalary = async (req, res) => {
    return res.render("member/about/recordsalary.ejs");
}

const incomeRecord = async (req, res) => {
    return res.render("member/about/incomeRecord.ejs")
}

const privacyPolicy = async (req, res) => {
    return res.render("member/about/privacyPolicy.ejs");
}

const newtutorial = async (req, res) => {
    return res.render("member/newtutorial.ejs");
}

const forgot = async (req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `time_otp` FROM users WHERE token = ? ', [auth]);
    let time = user[0].time_otp;
    return res.render("member/forgot.ejs", { time });
}

const redenvelopes = async (req, res) => {
    return res.render("member/redenvelopes.ejs");
}

const notification = async (req, res) => {
    return res.render("member/notification.ejs");
}

const riskAgreement = async (req, res) => {
    return res.render("member/about/riskAgreement.ejs");
}

const myProfilePage = async (req, res) => {
    return res.render("member/myProfile.ejs");
}

const getIncomeRecord = async (req, res) => {
    const auth = req.cookies.auth;

    const [rows] = await connection.query(`SELECT id_user FROM users WHERE token = ?`, [auth]);
    let rowstr = rows[0];
    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
        });
    }

    const [incomeRecord] = await connection.query(`SELECT * FROM income WHERE user_id = ?`, [rowstr.id_user]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {
            rows : incomeRecord
        }
    })
}
const getSalaryRecord = async (req, res) => {
    const auth = req.cookies.auth;

    const [rows] = await connection.query(`SELECT * FROM users WHERE token = ?`, [auth]);
    let rowstr = rows[0];
    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    const [getPhone] = await connection.query(
        `SELECT * FROM salary WHERE phone = ? ORDER BY time DESC`,
        [rowstr.phone]
    );


    console.log("asdasdasd : " + [rows.phone])
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {

        },
        rows: getPhone,
    })
}
module.exports = {
    homePage,
    getIncomeRecord,
    checkInPage,
    promotionPage,
    walletPage,
    referralWithdrowPage, 
    mianPage,
    myProfilePage,
    promotionmyTeamPage,
    promotionDesPage,
    tutorialPage,
    bonusRecordPage,
    rechargePage,
    rechargeDepositPage,
    rechargeDepositPost,
    rechargerecordPage,
    withdrawalPage,
    withdrawalrecordPage,
    referralWithdrowrecordpage,
    aboutPage,
    privacyPolicy,
    riskAgreement,
    newtutorial,
    redenvelopes,
    forgot,
    checkDes,
    checkRecord,
    addBank,
    transfer,
    recordsalary,
    getSalaryRecord,
    notification,
    activityPage,
    incomeRecord,
    currencyPage,
    rechargePageUSDT,
    rechargeDepositPostUSDT,
    rechargeDepositPageUSDT
}