const express = require('express');
const router = express.Router();
const mysql = require('mysql');
router.use(express.static('./public'))
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require("jsonwebtoken");
const config = require("../../config/config.json")
const generateToken = require("../../functions/generateTokens")
const mime = require("mime");
const passport = require("passport");
const fs = require("fs");
require("../../middleware/passport")(passport);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },

});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5
    }
});

const pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'yasmine'
})
function getConnection() {
    return pool
}


router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

function uploadFiles(req) {
    if (!req.files) {
        return ("file not exists")
    } else {
        if (req.files.length == 1)
            req.body.file_names = [req.body.file_names]
        req.files.forEach(async (element) => {
            console.log(element)
            const new_file_name =
                element.originalname;
            const file_uri = "upload/" + new_file_name + "." + mime.getExtension(element.mimetype);
            fs.rename(
                element.path,
                file_uri,
                function (err) {
                    if (err) throw err;
                }
            )
            let queryString = "update  users set image_url = ? WHERE user_id = ?";
            getConnection().query(queryString, [new_file_name + "." + mime.getExtension(element.mimetype), req.user.user_id], (err, results, fields) => { });
        })
        return ("upload done")
    }
};

router.post("/upload_profile_picture", passport.authenticate("jwt", { session: false }), upload.array("file", 12), (req, res) => {
    const result = uploadFiles(req);
    if (result == "upload done") {
        return res.status(200).json({
            success: true,
            message: "API.IMAGE-UPDATED",
            data: null
        })
    }
    return res.status(400).json({
        success: false,
        message: "API.INVALIDE-IMAGE",
        data: null
    })
});

/*router.post("/update_profile",passport.authenticate("jwt",{session:false}),(req,res)=>{
    const {user_name,user_last_name,email,region,password} = req.body;
    const user = req.user;
    let queryString = "update  users set user_name = ? , user_last_name = ? , email = ? , region = ? , password = ? WHERE user_id = ?";
    getConnection().query(queryString,[user_name,user_last_name,email,region,password,user.user_id],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            return res.status(500).json({
                success:false,
                message:"API.INTERNAL-SERVER-ERROR",
                data:null
            })
        }
        console.log("Successfully Updated User.");
        res.status(200).json({
            success:true,
            message:"API.USER-UPDATED",
            data:null
        })
    });
})*/

router.post('/register', (req, res) => {
    try {
        const { email, type, password } = req.body;
        let queryString = "SELECT * FROM user WHERE email = ?";
        getConnection().query(queryString, [email], (err, results, fields) => {
            if (err) {
                console.log("[ERROR]" + err)
                res.sendStatus(500)
                res.send("Erreur")
                return
            }
            if (results.length !== 0)
                return res.status(200).json({
                    success: false,
                    message: "API.USER-ALREADY-EXIST",
                    data: null
                })
            queryString = "INSERT INTO user(email, password, type) VALUES (?,?,?)";
            getConnection().query(queryString, [email, password, type], (err, results, fields) => {
                if (err) {
                    console.log("[ERROR]" + err)
                    res.sendStatus(500)
                    res.send("Erreur")
                    return
                }
                //send_sms(phone);
                res.status(200).json({
                    success: true,
                    message: "API.USER-CREATED",
                    data: null
                })
                console.log("Successfully Added User.");
            });
            console.log("Successfully Added User.");
        });

    } catch (err) {
        console.log(err)
    }
})


router.post('/login', (req, res) => {

    const { email, password } = req.body;
    console.log(email)
    console.log(password)
    const queryString = "SELECT * FROM user WHERE email = ? AND password = ?"
    getConnection().query(queryString, [email, password], (err, rows, fields) => {
        if (err) {
            console.log("[ERROR]" + err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        console.log("Successfully fetched.")
        if (rows.length == 0)
            return res.json({
                success: false,
                message: "API.USER-NOT-EXIST",
                data: null
            })
        delete rows[0].password;
        let obj = JSON.stringify(rows[0]);
        rows[0].token = generateToken(JSON.parse(obj));
        return res.json({ success: true, message: "API.USER-FETCHED", data: rows[0] })
    })
})


function performQuery(query, params) {
    return new Promise((resolve, reject) => {
        getConnection().query(query, params, (err, rows, fields) => {
            if (err) {
                console.log("[ERROR]" + err)
                res.sendStatus(500)
                res.send("fail")
                return
            }
            return resolve(rows)
        })
    })

}


router.get('/fetchmydata', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { userid } = req.query;
    console.log(userid)
    const userString = "SELECT * FROM user WHERE id = ? "
    const  formationString = "SELECT * FROM formation WHERE iduser = ? "
    const  competenceString = "SELECT * FROM competence WHERE iduser = ? "
    const  experiencesString = "SELECT * FROM exppro WHERE iduser = ? "
    let userdata = await performQuery(userString, [userid])
    let formations = await performQuery(formationString, [userid])
    let experiences = await performQuery(experiencesString, [userid])
    let competences = await performQuery(competenceString, [userid])
    console.log(userdata);
    return res.json({ success: true, message: "API.USERDATA-FETCHED", data: { "users": userdata, "experiences": experiences, "formations": formations, "competences": competences } })

})


module.exports = router;