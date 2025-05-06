const jwt = require('jsonwebtoken');
const md5 = require('md5');
const request = require('request');
const connection = require('../config/connectDB');

require('dotenv').config();

const nodemailer = require('nodemailer');

let timeNow = Date.now();

const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


const randomNumber = (min, max) => {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

const ipAddress = (req) => {
    let ip = '';
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
}

const timeCreate = () => {
    const d = new Date();
    const time = d.getTime();
    return time;
}

const loginPage = async (req, res) => {
    return res.render("account/login.ejs");
}

const registerPage = async (req, res) => {
    return res.render("account/register.ejs");
}

const forgotPage = async (req, res) => {
    return res.render("account/forgotPassword.ejs");
}

// const login = async (req, res) => {
//     let { phone, pwd } = req.body;
//     if (!phone || !pwd ) {//!isNumber(username)
//         return res.status(200).json({
//             message: 'ERROR!!!'
//         });
//     }

//     try {
//         const [rows] = await connection.query('SELECT * FROM users WHERE phone = ? AND password = ? ', [phone, md5(pwd)]);
//         if (rows.length == 1) {
//             if (rows[0].status == 1) {
//                 const { password, money, ip, veri, ip_address, status, time, ...others } = rows[0];
//                 const accessToken = jwt.sign({
//                     user: { ...others },
//                     timeNow: timeNow
//                 }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });
//                 await connection.execute('UPDATE `users` SET `token` = ? WHERE `phone` = ? ', [md5(accessToken), phone]);
//                 return res.status(200).json({
//                     message: 'Login Sucess',
//                     status: true,
//                     token: accessToken,
//                     value: md5(accessToken)
//                 });
//             } else {
//                 return res.status(200).json({
//                     message: 'Account has been locked',
//                     status: false
//                 });
//             }
//         } else {
//             return res.status(200).json({
//                 message: 'Incorrect Phone or Password',
//                 status: false
//             });
//         }
//     } catch (error) {
//         if (error) console.log(error);
//     }

// }


const login = async (req, res) => {
    let { phone, pwd } = req.body;
    if (!phone || !pwd) {
        return res.status(200).json({
            message: 'ERROR!!!'
        });
    }

    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, md5(pwd)]);
        if (rows.length === 1) {
            if (rows[0].status === 1) {
                const { password, money, ip, veri, ip_address, status, time, is_demo, ...others } = rows[0];
                const timeNow = Date.now();
                const accessToken = jwt.sign({
                    user: { ...others },
                    timeNow
                }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });

                await connection.execute('UPDATE `users` SET `token` = ? WHERE `phone` = ?', [md5(accessToken), phone]);

                // ✅ Set is_demo in cookie
                res.cookie('is_demo', is_demo, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });

                console.log('Cookie set: is_demo =', is_demo);

                return res.status(200).json({
                    message: 'Login Sucess',
                    status: true,
                    token: accessToken,
                    value: md5(accessToken),
                    is_demo_cookie: is_demo  // 👈 add this just for checking
                });

                
            } else {
                return res.status(200).json({
                    message: 'Account has been locked',
                    status: false
                });
            }
        } else {
            return res.status(200).json({
                message: 'Incorrect Phone or Password',
                status: false
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}





function isValidEmail(phone) {
    // Regular expression for basic email validation
    const emailRegex = /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/;
    return emailRegex.test(phone);
}


const register = async (req, res) => {
    let now = new Date().getTime();
    let {  pwd, invitecode,phone } = req.body;
    let id_user = randomNumber(10000, 99999);
    let otp2 = randomNumber(100000, 999999);
    let name_user = "Member" + randomNumber(10000, 99999);
    let code = randomString(5) + randomNumber(10000, 99999);
    let ip = ipAddress(req);
    let time = timeCreate();
    if (!phone || !pwd ) {
        return res.status(200).json({
            message: 'ERROR!!! Missing required fileds',
            status: false
        });
    }

    if (!isValidEmail(phone)) {
    return res.status(200).json({
        message: 'Please enter valid phone',
        status: false
    });
}


    // if (username.length < 9 || username.length > 10 || !isNumber(username)) {
    //     return res.status(200).json({
    //         message: 'phone error',
    //         status: false
    //     });
    // }

    try {
        // const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ?', [username]);
        const [check_email] = await connection.query('SELECT * FROM users WHERE phone = ?', [phone]);
        const [check_i] = await connection.query('SELECT * FROM users WHERE code = ? ', [invitecode]);
        const [check_ip] = await connection.query('SELECT * FROM users WHERE ip_address = ? ', [ip]);

        if (check_email.length == 1 && check_email[0].veri == 1) {
            return res.status(200).json({
                message: 'Phone is already registered',
                status: false
            });
        } else {
            // if (check_i.length == 1) {
            if (check_i.length == 1) {
                //if (check_ip.length <= 3) {
                    let ctv = '';
                    if (check_i[0].level == 2) {
                        ctv = check_i[0].phone;
                    } else {
                        ctv = check_i[0].ctv;
                    }
                    const sql = "INSERT INTO users SET id_user = ?,name_user = ?,password = ?, plain_password = ?, money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?,phone = ?";
                    await connection.execute(sql, [id_user,  name_user, md5(pwd), pwd, 0, code, invitecode, ctv, 1, otp2, ip, 1, time,phone]);
                    await connection.execute('INSERT INTO point_list SET phone = ?', [phone]);

                    let [check_code] = await connection.query('SELECT * FROM users WHERE invite = ? ', [invitecode]);

                    if(check_i.name_user !=='Admin'){
                        let levels = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44];

                        for (let i = 0; i < levels.length; i++) {
                            if (check_code.length >= levels[i]) {
                                await connection.execute('UPDATE users SET user_level = ? WHERE code = ?', [i + 1, invitecode]);
                            } else {
                                break;
                            }
                        }
                    }


                    return res.status(200).json({
                        message: "Registered successfully",
                        status: true
                    });
                // } else {
                //     return res.status(200).json({
                //         message: 'Registered IP address',
                //         status: false
                //     });
                // }
            } else {
                return res.status(200).json({
                    message: 'Referrer code does not exist',
                    status: false
                });
            }
        }
    } catch (error) {
        if (error) console.log(error);
    }

}

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    try {
        // Check if the email exists in the database
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 1) {
            // Retrieve the user's password
            const password = rows[0].plain_password; // Assuming password is stored in plain text (not recommended)

            // Send the password to the user's email address
            sendEmail(email, 'Password Recovery', `Your password is: ${password}`);

            return res.status(200).json({status:true, message: 'Password sent to your email' });
        } else {
            return res.status(404).json({status:false, message: 'Email address not found' });
        }
    } catch (error) {
        console.error('Error retrieving password:', error);
        return res.status(500).json({status:false, message: 'Internal server error' });
    }
};


const verifyCode = async (req, res) => {
    let phone = req.body.phone;
    let now = new Date().getTime();
    let timeEnd = (+new Date) + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);

    if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
        return res.status(200).json({
            message: 'phone error',
            status: false
        });
    }

    const [rows] = await connection.query('SELECT * FROM users WHERE `phone` = ?', [phone]);
    if (rows.length == 0) {
        await request(`http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${phone}&msg=Your verification code is ${otp}&extend=${now}`, async (error, response, body) => {
            let data = JSON.parse(body);
            if (data.code == '00000') {
                await connection.execute("INSERT INTO users SET phone = ?, otp = ?, veri = 0, time_otp = ? ", [phone, otp, timeEnd]);
                return res.status(200).json({
                    message: 'Submitted successfully',
                    status: true,
                    timeStamp: timeNow,
                    timeEnd: timeEnd,
                });
            }
        });
    } else {
        let user = rows[0];
        if (user.time_otp - now <= 0) {
            request(`http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${phone}&msg=Your verification code is ${otp}&extend=${now}`, async (error, response, body) => {
                let data = JSON.parse(body);
                if (data.code == '00000') {
                    await connection.execute("UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ", [otp, timeEnd, phone]);
                    return res.status(200).json({
                        message: 'Submitted successfully',
                        status: true,
                        timeStamp: timeNow,
                        timeEnd: timeEnd,
                    });
                }
            });
        } else {
            return res.status(200).json({
                message: 'Send SMS regularly',
                status: false,
                timeStamp: timeNow,
            });
        }
    }

}

const verifyCodePass = async (req, res) => {
    let phone = req.body.phone;
    let now = new Date().getTime();
    let timeEnd = (+new Date) + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);

    if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
        return res.status(200).json({
            message: 'phone error',
            status: false
        });
    }

    const [rows] = await connection.query('SELECT * FROM users WHERE `phone` = ? AND veri = 1', [phone]);
    if (rows.length == 0) {
        return res.status(200).json({
            message: 'Account does not exist',
            status: false,
            timeStamp: timeNow,
        });
    } else {
        let user = rows[0];
        if (user.time_otp - now <= 0) {
            request(`http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${phone}&msg=Your verification code is ${otp}&extend=${now}`, async (error, response, body) => {
                let data = JSON.parse(body);
                if (data.code == '00000') {
                    await connection.execute("UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ", [otp, timeEnd, phone]);
                    return res.status(200).json({
                        message: 'Submitted successfully',
                        status: true,
                        timeStamp: timeNow,
                        timeEnd: timeEnd,
                    });
                }
            });
        } else {
            return res.status(200).json({
                message: 'Send SMS regularly',
                status: false,
                timeStamp: timeNow,
            });
        }
    }

}

const forGotPassword = async (req, res) => {
    let username = req.body.username;
    let otp = req.body.otp;
    let pwd = req.body.pwd;
    let now = new Date().getTime();
    let timeEnd = (+new Date) + 1000 * (60 * 2 + 0) + 500;
    let otp2 = randomNumber(100000, 999999);

    if (username.length < 9 || username.length > 10 || !isNumber(username)) {
        return res.status(200).json({
            message: 'phone error',
            status: false
        });
    }

    const [rows] = await connection.query('SELECT * FROM users WHERE `phone` = ? AND veri = 1', [username]);
    if (rows.length == 0) {
        return res.status(200).json({
            message: 'Account does not exist',
            status: false,
            timeStamp: timeNow,
        });
    } else {
        let user = rows[0];
        if (user.time_otp - now > 0) {
            if (user.otp == otp) {
                await connection.execute("UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ? ", [md5(pwd), otp2, timeEnd, username]);
                return res.status(200).json({
                    message: 'Change password successfully',
                    status: true,
                    timeStamp: timeNow,
                    timeEnd: timeEnd,
                });
            } else {
                return res.status(200).json({
                    message: 'OTP code is incorrect',
                    status: false,
                    timeStamp: timeNow,
                });
            }
        } else {
            return res.status(200).json({
                message: 'OTP code has expired',
                status: false,
                timeStamp: timeNow,
            });
        }
    }

}

const keFuMenu = async(req, res) => {
    let auth = req.cookies.auth;

    const [users] = await connection.query('SELECT `level`, `ctv` FROM users WHERE token = ?', [auth]);

    let telegram = '';
    if (users.length == 0) {
        let [settings] = await connection.query('SELECT `telegram`, `cskh` FROM admin');
        telegram = settings[0].telegram;
    } else {
        if (users[0].level != 0) {
            var [settings] = await connection.query('SELECT * FROM admin');
        } else {
            var [check] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ?', [users[0].ctv]);
            if (check.length == 0) {
                var [settings] = await connection.query('SELECT * FROM admin');
            } else {
                var [settings] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ?', [users[0].ctv]);
            }
        }
        telegram = settings[0].telegram;
    }
    
    return res.render("keFuMenu.ejs", {telegram}); 
}

// Function to send email
const sendEmail = async (recipient, subject, message) => {
    // Create a transporter
    let transporter = nodemailer.createTransport({
        // Specify your email service provider and authentication details
        service: 'gmail', // Assuming you're using Gmail
        auth: {
            user: process.env.SMTP_MAIL, // Your email address
            pass: process.env.SMTP_PASS // Your email password or app password
        }
    });

    // Email message options
    let mailOptions = {
        from: process.env.SMTP_MAIL, // Sender address
        to: recipient, // List of recipients
        subject: subject, // Subject line
        text: message // Plain text body
        // You can also use `html` property to send HTML formatted emails
    };

    try {
        // Send the email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw error for error handling in the calling function
    }
};


module.exports = {
    login,
    register,
    forgotPassword,
    loginPage,
    registerPage,
    forgotPage,
    verifyCode,
    verifyCodePass,
    forGotPassword,
    keFuMenu
}