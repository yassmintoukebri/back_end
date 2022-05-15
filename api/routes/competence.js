const express = require('express');
const router = express.Router();
const mysql = require('mysql');
router.use(express.static('./public'))
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}))
const passport = require("passport")
const config = require("../../config/config.json")
const axios = require('axios')
require("../../middleware/passport")(passport);


const pool = mysql.createPool({
    connectionLimit: 10 ,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'yasmine'
})
function getConnection(){
    return pool
}
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.get('/fetchcompetences',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
        const {userid} = req.query;
        const queryString = "SELECT * FROM `competence` WHERE `id` = ?";
        getConnection().query(queryString,[userid],(err,rows,fields)=>{
            if(err){
                console.log("[ERROR]"+err)
                res.sendStatus(500)
                res.send("fail")
                return
            }
            return res.status(200).json({
                success:true,
                message:"API.COMPETENCES-FETCHED",
                data:rows
            })
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:"API.INTERNAL-SERVER-ERROR",
            data:null
        })
    }
})

router.post('/create',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
    const {iduser,type,description} = req.body;
    const queryString = "INSERT INTO `competence`(`iduser`, `type`, `description`) VALUES (?,?,?)";
    getConnection().query(queryString,[iduser,type,description],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.COMPETENCE-CREATED",
            data:null
        })

    });
}catch(err){
    console.log(err)
    return res.status(500).json({
        success:false,
        message:"API.INTERNAL-SERVER-ERROR",
        data:null
    })
}
})

router.delete('/delete',passport.authenticate("jwt", { session: false }),(req,res)=>{
    const {id} = req.query;
    const  queryString = "DELETE FROM `competence` WHERE `id` = ?";
    getConnection().query(queryString,[id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.COMPETENCE-DELETED",
            data:null
        })
    })

})


module.exports = router;