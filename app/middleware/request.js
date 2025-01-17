const jwt = require('jsonwebtoken');
const controller = require('../controller/user.js');

module.exports = {

 verifyLogin : (cookietoken,res) =>{
    
    let secretkey = process.env.JWT_SECRETKEY;
      
    console.log(cookietoken," cookietoken");
    if(cookietoken == undefined){
       res.clearCookie('jwtauth');
       return "invalid";
    }else{
        try {
            let verified = jwt.verify(cookietoken, secretkey);
            console.log("jwt verifier--- " , verified);
            return verified;

        }catch (error) {
            res.clearCookie('jwtauth');
            return res.redirect('/elective/loginPage');
        }
    }
},

 verifyRequest : (req,res,next) => {

    try{

   let token = process.env.JWT_SECRETKEY;
   let cookietoken = req.signedCookies.jwtauth || undefined;

   console.log("request cookie" , cookietoken);
   
   let verified = jwt.verify(cookietoken,token);

   if(verified){
     next();
   }else{
      return res.redirect('/elective/loginPage');
   }

    }catch(error){
        res.clearCookie('jwtauth');
       return res.redirect('/elective/loginPage');
    }
 

 }

};