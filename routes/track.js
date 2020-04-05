var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db.js');
var funcs = require('../controllers/trackController')
const timeout = 1200 //time out in seconds 


/* GET users listing. */
router.get('/', (req, res, next) => {

    let query_string = `SELECT * FROM ??`;
    let table_name = req.query.table;

    async function getResult() {
        let result = await db.query(query_string, [table_name]);
        return result;
    }

    getResult().then(result => {
        res.status(200);
        res.send({
            status: "ok",
            rows: result
        })
    }).catch(e => {
        res.status(404);
        res.send({
            status: "fail",
            error: e
        })
    })

})

router.post('/', function(req, res, next) {

    //console.log(funcs);


    funcs.insertNewPing(req)
        .then(insertId => funcs.getPreviousPing(insertId))
        .then(props => funcs.fillCumalativeTablesParallel(props))
        .then(() => {
            res.status(200);
            res.json({ status: "ok" })
        })
        .catch(e => {
            console.error(e)
            res.status(500);
            res.json({
                status: "failed",
                error: e
            })
        });





});

module.exports = router;
