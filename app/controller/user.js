let query = require("../queries/user.js");
let argon = require("argon2");
const { get } = require("../router/route.js");
const jwt =require('jsonwebtoken');
const jwtauth = require('../middleware/request.js');

module.exports = {
  loginPage:async function (req, res) {

    try{
   
    let jwtreturn = await jwtauth.verifyLogin(req.signedCookies.jwtauth,res);
    
    if(jwtreturn === "invalid"){
    
    let error = req.flash('error') || null;
    res.render("login",{auth:error});

    }else{
      return res.redirect('/elective/dashboard');
    }
  }catch(err){
    return res.redirect("/elective/error");
  }
  },

  login: async function (req, res) {

    let username = req.body.username;
    let password = req.body.password;

    console.log("request data " + req.body.username);

    try {
      let querydata = await query.authenticateLogin(username);
      console.log("Query Data:", querydata);

      if (querydata != undefined) {
       
        let pass = querydata[0].password;
        let passwordVal = await argon.verify(pass, password);
  
        if (passwordVal) {

          console.log("Authenticated Successfully");

          req.session.modules = querydata[0].username;
       
          const user =  querydata[0].username;
          const secretkey = process.env.JWT_SECRETKEY;

          console.log('secretkey---- ' +  secretkey);
          const token = await jwt.sign({username:user},process.env.JWT_SECRETKEY,{expiresIn:'1 day'});
          
            res.cookie("jwtauth",token,{signed:true,maxAge:24 * 60 * 60 * 1000,path:'/',httponly:true});
            return res.redirect("/elective/dashboard");

        } else {
          console.log("Unauthenticated");

          req.flash('error','Invalid password');
          return res.redirect("/elective/loginPage");
       
        }
      } else {
        console.log("Invalid username");
        req.flash('error','Invalid username');
        return res.redirect("/elective/loginPage");
      }
    } catch (err) {
      return res.redirect("/elective/error");
    }
  },


  errorPage: async function (req,res) {
   return res.render("500");
  },

  dashboard: async function(req,res,next){

    try{

     let usermodules = req.session.modules;

     if(usermodules != null){

      let getModules = await query.getModules(usermodules);
      return res.render("dashboard",{module : getModules});

     }else{
      res.clearCookie('jwtauth');
      req.flash('error','Oops, Session Timeout Login Again!! ');
      return res.redirect("/elective/loginPage");

     } 
    } catch(err){
      return res.redirect("/elective/error");
    }
  },

  logout:async function(req,res){

    try{

   req.session.destroy();
   res.clearCookie("jwtauth");

   return res.redirect("/elective/loginPage");

    }catch(err){
      return res.redirect("/elective/error");
    }
   
  },

};