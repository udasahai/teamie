var express = require('express');
var pool = require('../db.js');
var router = express.Router();
var mysql = require('mysql');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Add some User');
});

router.post('/', function(req, res, next) {

    var datum = {
        site_id: req.body.site_id,
        user_id: req.body.user_id,
        tracking_type: req.body.tracking_type,
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        group_id: req.body.group_id,
        page_title: req.body.page_title,
        page_url: req.body.page_url,
        timestamp: req.body.timestamp,
        client_type: req.body.client_type,
        client_id: req.body.client_id,
        client_name: req.body.client_name,
        client_version: req.body.client_version,
        ip_address: req.body.ip_address,
        user_agent: req.body.user_agent
    }

    var post = {
        site_id: req.body.site_id,
        user_id: req.body.user_id,
        tracking_type: req.body.tracking_type,
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        group_id: req.body.group_id,
        page_title: req.body.page_title,
        page_url: req.body.page_url,
        timestamp: req.body.timestamp,
        client_type: req.body.client_type,
        client_id: req.body.client_id,
        client_name: req.body.client_name,
        client_version: req.body.client_version,
        ip_address: req.body.ip_address,
        user_agent: req.body.user_agent,
        data: JSON.stringify(datum)
    }

    let firstQuery = new Promise((resolve, reject) => {

        pool.query(
            'INSERT INTO track SET ?', post,
            function(error, results, fields) {
                if (error) {
                    reject(error);
                }
                else
                    resolve(results);
            });
    });


    let secondQuery = new Promise((resolve, reject) => {

        var query_string = mysql.format('SELECT last_track_id FROM user_type_total WHERE \
           site_id = ? AND user_id = ? AND tracking_type = ?', [req.body.site_id, req.body.user_id,
            req.body.tracking_type
        ]);

        console.log(query_string);

        pool.query(
            query_string,
            function(error, results, fields) {
                if (error) {
                    reject(error)
                }
                else {
                    console.log(results)
                    resolve(results);
                }
            }


        )
    });

    // let second_follow = secondQuery.then((results) => {
    //     var query_string = mysql.format('SELECT')
    //     if (results.length <= 0) {
    //         pool.query()
    //     }
    // });


    Promise.all([firstQuery])
        .then((results) => {
            res.status(200);
            res.json({ status: "ok" })
        })
        .catch((err) => {
            res.status(400);
            res.json({ status: 'fail' })
        });


});

module.exports = router;
