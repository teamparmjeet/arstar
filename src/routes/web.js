const express = require('express');
const accountController = require('../controllers/accountController');
const adminController = require('../controllers/adminController');
const dailyController = require('../controllers/dailyController');
const fileController = require('../controllers/fileUploadController');
const homeController = require('../controllers/homeController');
const k3Controller = require('../controllers/k3Controller');
const k5Controller = require('../controllers/k5Controller');
const middlewareController = require('../controllers/middlewareController');
const userController = require('../controllers/userController');
const winGoController = require('../controllers/winGoController');

let router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const initWebRouter = (app) => {
  // page account
  router.get('/keFuMenu', accountController.keFuMenu);
  router.get('/login', accountController.loginPage);
  router.get('/register', accountController.registerPage);
  router.get('/forgot', accountController.forgotPage);
  router.post('/api/resetPassword', accountController.forgotPassword)
  router.post('/api/sent/otp/verify', accountController.verifyCode);
  router.post('/api/sent/otp/verify/reset', accountController.verifyCodePass);
  router.post('/api/resetPasword', accountController.forGotPassword);

  // file uplaod
  router.post('/api/upload', (req, res, next) => {
    fileController.upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file size limit exceeded)
        res.status(400).json({ status: false, message: 'File upload error: ' + err.message });
      } else if (err) {
        // An unknown error occurred
        res.status(500).json({ status: false, message: 'Internal server error' });
      } else {
        // No error, file uploaded successfully
        res.status(200).json({ status: true, message: 'File uploaded successfully' });
      }
    });
  });

  router.get('/api/files', async (req, res) => {
    try {
      const files = await fileController.listFiles('src/public/uploads/');
      res.status(200).json(files);
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    try {
      const fileStream = fileController.downloadFile(filename, '/var/www/html/nomolo/uploads/');
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(404).json({ error: 'File not found' });
    }
  });

  // Route to delete a file
  router.delete('/api/files/:filename', async (req, res) => {
    const { filename } = req.params;
    const storageDirectory = 'src/public/uploads/'; // Update with your storage directory path
    try {
      const result = await fileController.deleteFile(filename, storageDirectory);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // page home
  router.get('/', (req, res) => {
    return res.redirect('/home');
  });
  router.get('/home', homeController.homePage);

  router.get('/checkIn', middlewareController, homeController.checkInPage);
  router.get('/activity', middlewareController, homeController.activityPage);
  router.get('/checkDes', middlewareController, homeController.checkDes);
  router.get('/checkRecord', middlewareController, homeController.checkRecord);
  router.get('/wallet/transfer', middlewareController, homeController.transfer);

  router.get('/promotion', middlewareController, homeController.promotionPage);
  router.get('/promotion/myTeam', middlewareController, homeController.promotionmyTeamPage);
  router.get('/promotion/promotionDes', middlewareController, homeController.promotionDesPage);
  router.get('/promotion/tutorial', middlewareController, homeController.tutorialPage);
  router.get('/promotion/bonusrecord', middlewareController, homeController.bonusRecordPage);

  router.get('/wallet', middlewareController, homeController.walletPage);

  router.get('/wallet/recharge', middlewareController, homeController.rechargePage);
  router.get('/wallet/recharge_usdt', middlewareController, homeController.rechargePageUSDT);

  router.get('/wallet/deposit', middlewareController, homeController.rechargeDepositPage);
  router.get('/wallet/deposit_usdt', middlewareController, homeController.rechargeDepositPageUSDT);

  router.post('/api/wallet/deposit/post', middlewareController, homeController.rechargeDepositPost);
  router.post('/api/wallet/deposit_usdt/post', middlewareController, homeController.rechargeDepositPostUSDT);

  router.get('/wallet/currency', middlewareController, homeController.currencyPage);

  router.get('/wallet/withdrawal', middlewareController, homeController.withdrawalPage);
  router.get('/wallet/rechargerecord', middlewareController, homeController.rechargerecordPage);
  router.get('/wallet/withdrawalrecord', middlewareController, homeController.withdrawalrecordPage);
  router.get('/wallet/referralWithdrow', middlewareController, homeController.referralWithdrowPage);
  router.get('/wallet/referralWithdrowrecord', middlewareController, homeController.referralWithdrowrecordpage);
  router.get('/wallet/addBank', middlewareController, homeController.addBank);

  router.get('/mian', middlewareController, homeController.mianPage);

  router.get('/recordsalary', middlewareController, homeController.recordsalary);

  // new routing
  router.get('/incomeRecord', middlewareController, homeController.incomeRecord);

  router.get('/getrecord', middlewareController, homeController.getSalaryRecord);

  router.get('/getIncomeRecord', middlewareController, homeController.getIncomeRecord);

  router.get('/about', middlewareController, homeController.aboutPage);
  router.get('/redenvelopes', middlewareController, homeController.redenvelopes);
  router.get('/notification', middlewareController, homeController.notification);
  router.get('/mian/forgot', middlewareController, homeController.forgot);
  router.get('/newtutorial', homeController.newtutorial);
  router.get('/about/privacyPolicy', middlewareController, homeController.privacyPolicy);
  router.get('/about/riskAgreement', middlewareController, homeController.riskAgreement);

  router.get('/myProfile', middlewareController, homeController.myProfilePage);



  // BET wingo
  router.get('/win', middlewareController, winGoController.winGoPage);
  router.get('/win/3', middlewareController, winGoController.winGoPage3);
  router.get('/win/5', middlewareController, winGoController.winGoPage5);
  router.get('/win/10', middlewareController, winGoController.winGoPage10);

  // BET K5D
  router.get('/5d', middlewareController, k5Controller.K5DPage);
  router.post('/api/webapi/action/5d/join', middlewareController, k5Controller.betK5D); // register
  router.post('/api/webapi/5d/GetNoaverageEmerdList', middlewareController, k5Controller.listOrderOld); // register
  router.post('/api/webapi/5d/GetMyEmerdList', middlewareController, k5Controller.GetMyEmerdList); // register

  // BET K3
  router.get('/k3', middlewareController, k3Controller.K3Page);

  router.post('/api/webapi/action/k3/join', middlewareController, k3Controller.betK3); // register
  router.post('/api/webapi/k3/GetNoaverageEmerdList', middlewareController, k3Controller.listOrderOld); // register
  router.post('/api/webapi/k3/GetMyEmerdList', middlewareController, k3Controller.GetMyEmerdList); // register


  // login | register 
  router.post('/api/webapi/login', accountController.login); // login
  router.post('/api/webapi/register', accountController.register); // register
  router.get('/aviator', middlewareController, userController.aviator);
  router.get('/api/webapi/GetUserInfo', middlewareController, userController.userInfo); // get info account
  router.put('/api/webapi/change/userInfo', middlewareController, userController.changeUser); // get info account
  router.put('/api/webapi/change/pass', middlewareController, userController.changePassword); // get info account
  
  router.get('/api/webapi/referralWithdraw', middlewareController, userController.referralWithdraw);
  router.post('/api/webapi/checkUserByPhone', middlewareController, userController.checkUserByPhone);
  router.post('/api/webapi/sendMoney', middlewareController, userController.sendMoney);



  // bet wingo
  router.post('/api/webapi/action/join', middlewareController, winGoController.betWinGo); // register
  router.post('/api/webapi/GetNoaverageEmerdList', middlewareController, winGoController.listOrderOld); // register
  router.post('/api/webapi/GetMyEmerdList', middlewareController, winGoController.GetMyEmerdList); // register


  // promotion
  router.post('/api/webapi/promotion', middlewareController, userController.promotion); // register
  router.post('/api/webapi/checkIn', middlewareController, userController.checkInHandling); // register
  router.post('/api/webapi/check/Info', middlewareController, userController.infoUserBank); // register
  router.post('/api/webapi/addBank', middlewareController, userController.addBank); // register
  router.post('/api/webapi/otp', middlewareController, userController.verifyCode); // register
  router.post('/api/webapi/use/redenvelope', middlewareController, userController.useRedenvelope); // register

  // wallet
  router.post('/api/webapi/recharge', middlewareController, userController.recharge);

  router.post('/wowpay/create', middlewareController, userController.wowpay);
  router.post('/api/webapi/confirm_recharge', middlewareController, userController.confirmRecharge);
  router.get('/api/webapi/myTeam', middlewareController, userController.listMyTeam); // register
  router.get('/api/webapi/recharge/list', middlewareController, userController.listRecharge); // register
  router.get('/api/webapi/withdraw/list', middlewareController, userController.listWithdraw); // register
  router.post('/api/webapi/recharge/check', middlewareController, userController.recharge2); // register
  router.post('/api/webapi/withdrawal', middlewareController, userController.withdrawal3);  // register
  router.post('/api/webapi/callback_bank', middlewareController, userController.callback_bank); // register
  router.post('/api/webapi/recharge/update', middlewareController, userController.updateRecharge); // update recharge
  router.post('/api/webapi/transfer', middlewareController, userController.transfer); // register
  router.get('/api/webapi/transfer_history', middlewareController, userController.transferHistory); //
  router.get('/api/webapi/referral/withdraw/list', middlewareController, userController.listReferralWithdraw);

  router.post('/api/webapi/search', middlewareController, userController.search); // register


  // daily
  router.get('/manager/index', dailyController.middlewareDailyController, dailyController.dailyPage);
  router.get('/manager/listRecharge', dailyController.middlewareDailyController, dailyController.listRecharge);
  router.get('/manager/listWithdraw', dailyController.middlewareDailyController, dailyController.listWithdraw);
  router.get('/manager/members', dailyController.middlewareDailyController, dailyController.listMeber);
  router.get('/manager/profileMember', dailyController.middlewareDailyController, dailyController.profileMember);
  router.get('/manager/settings', dailyController.middlewareDailyController, dailyController.settingPage);
  router.get('/manager/gifts', dailyController.middlewareDailyController, dailyController.giftPage);
  router.get('/manager/support', dailyController.middlewareDailyController, dailyController.support);
  router.get('/manager/member/info/:phone', dailyController.middlewareDailyController, dailyController.pageInfo);

  router.post('/manager/member/info/:phone', dailyController.middlewareDailyController, dailyController.userInfo);
  router.post('/manager/member/listRecharge/:phone', dailyController.middlewareDailyController, dailyController.listRechargeMem);
  router.post('/manager/member/listWithdraw/:phone', dailyController.middlewareDailyController, dailyController.listWithdrawMem);
  router.post('/manager/member/redenvelope/:phone', dailyController.middlewareDailyController, dailyController.listRedenvelope);
  router.post('/manager/member/bet/:phone', dailyController.middlewareDailyController, dailyController.listBet);


  router.post('/manager/settings/list', dailyController.middlewareDailyController, dailyController.settings);
  router.post('/manager/createBonus', dailyController.middlewareDailyController, dailyController.createBonus);
  router.post('/manager/listRedenvelops', dailyController.middlewareDailyController, dailyController.listRedenvelops);

  router.post('/manager/listRecharge', dailyController.middlewareDailyController, dailyController.listRechargeP);
  router.post('/manager/listWithdraw', dailyController.middlewareDailyController, dailyController.listWithdrawP);

  router.post('/api/webapi/statistical', dailyController.middlewareDailyController, dailyController.statistical);
  router.post('/manager/infoCtv', dailyController.middlewareDailyController, dailyController.infoCtv); // get info account
  router.post('/manager/infoCtv/select', dailyController.middlewareDailyController, dailyController.infoCtv2); // get info account
  router.post('/api/webapi/manager/listMember', dailyController.middlewareDailyController, dailyController.listMember); // get info account

  router.post('/api/webapi/manager/buff', dailyController.middlewareDailyController, dailyController.buffMoney); // get info account


  // admin
  router.get('/admin/manager/index', adminController.middlewareAdminController, adminController.adminPage); // get info account
  router.get('/admin/manager/index/3', adminController.middlewareAdminController, adminController.adminPage3); // get info account
  router.get('/admin/manager/index/5', adminController.middlewareAdminController, adminController.adminPage5); // get info account
  router.get('/admin/manager/index/10', adminController.middlewareAdminController, adminController.adminPage10); // get info account

  router.get('/admin/manager/5d', adminController.middlewareAdminController, adminController.adminPage5d); // get info account
  router.get('/admin/manager/k3', adminController.middlewareAdminController, adminController.adminPageK3); // get info account


  router.get('/admin/manager/members', adminController.middlewareAdminController, adminController.membersPage); // get info account
  router.get('/admin/manager/createBonus', adminController.middlewareAdminController, adminController.giftPage); // get info account
  router.get('/admin/manager/manageBanners', adminController.middlewareAdminController, adminController.manageBanners); // get info account
  router.get('/admin/manager/ctv', adminController.middlewareAdminController, adminController.ctvPage); // get info account
  router.get('/admin/manager/ctv/profile/:phone', adminController.middlewareAdminController, adminController.ctvProfilePage); // get info account

  router.get('/admin/manager/settings', adminController.middlewareAdminController, adminController.settings); // get info account
  router.get('/admin/manager/listRedenvelops', adminController.middlewareAdminController, adminController.listRedenvelops); // get info account
  router.post('/admin/manager/infoCtv', adminController.middlewareAdminController, adminController.infoCtv); // get info account
  router.post('/admin/manager/infoCtv/select', adminController.middlewareAdminController, adminController.infoCtv2); // get info account
  router.post('/admin/manager/settings/bank', adminController.middlewareAdminController, adminController.settingBank); // get info account
  router.post('/admin/manager/settings/cskh', adminController.middlewareAdminController, adminController.settingCskh); // get info account
  router.post('/admin/manager/settings/buff', adminController.middlewareAdminController, adminController.settingbuff); // get info account
  router.post('/admin/manager/create/ctv', adminController.middlewareAdminController, adminController.register); // get info account
  router.post('/admin/manager/settings/get', adminController.middlewareAdminController, adminController.settingGet); // get info account
  router.post('/admin/manager/createBonus', adminController.middlewareAdminController, adminController.createBonus); // get info account

  router.post('/admin/manager/settings/upload/qr', upload.single('qr_file'), adminController.middlewareAdminController, adminController.settingUploadQr);

  router.post('/admin/member/listRecharge/:phone', adminController.middlewareAdminController, adminController.listRechargeMem);
  router.post('/admin/member/listWithdraw/:phone', adminController.middlewareAdminController, adminController.listWithdrawMem);
  router.post('/admin/member/redenvelope/:phone', adminController.middlewareAdminController, adminController.listRedenvelope);
  router.post('/admin/member/bet/:phone', adminController.middlewareAdminController, adminController.listBet);


  router.get('/admin/manager/incomePage', adminController.middlewareAdminController, adminController.incomePage);


  router.get('/admin/manager/recharge', adminController.middlewareAdminController, adminController.rechargePage); // get info account
  router.get('/admin/manager/withdraw', adminController.middlewareAdminController, adminController.withdraw); // get info account
 // router.get('/admin/manager/level', adminController.middlewareAdminController, adminController.level); // get info account
  router.get('/admin/manager/levelSetting', adminController.middlewareAdminController, adminController.levelSetting);
  router.get('/admin/manager/CreatedSalaryRecord', adminController.middlewareAdminController, adminController.CreatedSalaryRecord);
  router.get('/admin/manager/rechargeRecord', adminController.middlewareAdminController, adminController.rechargeRecord); // get info account
  router.get('/admin/manager/withdrawRecord', adminController.middlewareAdminController, adminController.withdrawRecord); // get info account
  router.get('/admin/manager/statistical', adminController.middlewareAdminController, adminController.statistical); // get info account
  router.get('/admin/member/info/:id', adminController.middlewareAdminController, adminController.infoMember);
  router.get('/api/webapi/admin/getLevelInfo', adminController.middlewareAdminController, adminController.getLevelInfo);
  router.get('/api/webapi/admin/getSalary', adminController.middlewareAdminController, adminController.getSalary);

  router.post('/api/webapi/admin/updateLevel', adminController.middlewareAdminController, adminController.updateLevel); // get info account
  router.post('/api/webapi/admin/CreatedSalary', adminController.middlewareAdminController, adminController.CreatedSalary); // get info account
  router.post('/api/webapi/admin/listMember', adminController.middlewareAdminController, adminController.listMember); // get info account
  router.post('/api/webapi/admin/listctv', adminController.middlewareAdminController, adminController.listCTV); // get info account
  router.post('/api/webapi/admin/withdraw', adminController.middlewareAdminController, adminController.handlWithdraw); // get info account
  router.post('/api/webapi/admin/recharge', adminController.middlewareAdminController, adminController.recharge); // get info account

  router.post('/api/webapi/admin/incomePage', adminController.middlewareAdminController, adminController.getIncomePage); // get income page

  router.post('/api/webapi/admin/rechargeDuyet', adminController.middlewareAdminController, adminController.rechargeDuyet); // get info account
  router.post('/api/webapi/admin/member/info', adminController.middlewareAdminController, adminController.userInfo); // get info account
  router.post('/api/webapi/admin/statistical', adminController.middlewareAdminController, adminController.statistical2); // get info account

  router.post('/api/webapi/admin/banned', adminController.middlewareAdminController, adminController.banned); // get info account


  router.post('/api/webapi/admin/totalJoin', adminController.middlewareAdminController, adminController.totalJoin); // get info account
  router.post('/api/webapi/admin/change', adminController.middlewareAdminController, adminController.changeAdmin); // get info account
  router.post('/api/webapi/admin/profileUser', adminController.middlewareAdminController, adminController.profileUser); // get info account

  // admin 5d 
  router.post('/api/webapi/admin/5d/listOrders', adminController.middlewareAdminController, adminController.listOrderOld); // get info account
  router.post('/api/webapi/admin/k3/listOrders', adminController.middlewareAdminController, adminController.listOrderOldK3); // get info account
  router.post('/api/webapi/admin/5d/editResult', adminController.middlewareAdminController, adminController.editResult); // get info account
  router.post('/api/webapi/admin/k3/editResult', adminController.middlewareAdminController, adminController.editResult2); // get info account

  return app.use('/', router);
}

module.exports = {
  initWebRouter,
};