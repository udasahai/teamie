var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db.js');
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
        res.status(400);
        res.send({
            status: "fail"
        })
    })

})

router.post('/', function(req, res, next) {


    // let firstQuery = new Promise((resolve, reject) => {

    //     pool.query(
    //         'INSERT INTO track SET ?', post,
    //         function(error, results, fields) {
    //             if (error) {
    //                 reject(error);
    //             }
    //             else
    //                 resolve(results);
    //         });
    // });

    async function insertNewPing() {

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

        let result = await db.query('INSERT INTO track SET ?', post);
        return result.insertId;
    }


    const getPreviousPing = async(insertId) => {

        const query_string = "SELECT * FROM track where user_id=? and id!= ORDER BY DESC LIMIT 1?" //Get the previous ping, exlude the currently inserted one. 
        const args = [req.body.user_id, insertId];

        let result = await db.query(query_string, args);

        let props = {};
        props.result = result;
        props.insertId = insertId

        return props;
    }


    const fillCumalativeTablesParallel = async(props) => {

        let result = props.result;
        let insertId = props.insertId;

        console.log(result)

        if (result.length == 0)
            return false;

        let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
        let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 

        if (time_bw_pings > timeout)
            return false;

        return await Promise.All(fillCumalativeTables(props));

    }


    const fillCumalativeTables = async(props) => {

        let result = props.result;
        let insertId = props.insertId;

        let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
        let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 


        //See if we can fill table 2 by comparing the site_id, user_id and tracking_type fields
        if (req.body.user_id == result[0].user_id && req.body.site_id == result[0].site_id && req.body.tracking_type == result[0].tracking_type) {

            let query_string = `SELECT total_time FROM user_type_total
                                    WHERE site_id = ? and user_id = ? and tracking_type = ?)`
            let args = [req.body.site_id, req.body.user_id, req.body.tracking_type]
            let res = await db.query(query_string, args);

            if (res.length == 0)
                return false;

            let total_time = res[0].total_time + time_bw_pings;

            query_string = `UPDATE user_type_total SET ? WHERE site_id = ? and user_id = ? and tracking_type = ?`;
            args = [{ last_track_id: insertId, total_time: total_time },
                req.body.site_id, req.body.user_id, req.body.tracking_type
            ]
            return await db.query(query_string, args);
        }

        return false;
    }

    async function second(insertId) {
        let query_string = `SELECT track.id, user_type_total.total_time FROM track, user_type_total
             WHERE (track.id ,user_type_total.total_time) = (
                 SELECT last_track_id, total_time FROM user_type_total
                 WHERE site_id = ? and user_id = ? and tracking_type = ?)`;

        let args = [req.body.site_id, req.body.user_id, req.body.tracking_type];

        // console.log(mysql.format(query_string, args))

        let result = await db.query(
            query_string, args
        )

        if (result.length == 0) { //This means that we have an entry in the user_type total table for this site_id, user_id and tracking_type
            await db.query(`INSERT INTO user_type_total SET ?`, {
                site_id: req.body.site_id,
                user_id: req.body.user_id,
                tracking_type: req.body.tracking_type,
                total_time: 0,
                last_track_id: insertId
            })

            return true;

        }
        else {

            var last_track_id = result[0].id;
            var total_time = result[0].total_time;

            result = await db.query(
                `SELECT timestamp FROM track 
             WHERE id = ?`, [last_track_id]
            );

            let prev_timestamp = parseInt(result[0].timestamp);
            // console.log("Prev timestamp " + prev_timestamp);

            let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp
            // console.log("time between pings " + time_bw_pings);

            let update_query = `UPDATE user_type_total SET ? WHERE site_id = ? and user_id = ? and tracking_type = ?`


            if (time_bw_pings > timeout) {
                let args = [{ last_track_id: insertId },
                    req.body.site_id, req.body.user_id, req.body.tracking_type
                ]
                return await db.query(update_query, args)
            }
            else {
                let new_total_time = total_time + time_bw_pings
                let args = [{ last_track_id: insertId, total_time: new_total_time },
                    req.body.site_id, req.body.user_id, req.body.tracking_type
                ]
                return await db.query(update_query, args)
            }

        }


    }

    // insertNewPing().then((insertId) => second(insertId)).catch(e => console.error(e));

    let previous_ping = insertNewPing().then(insertId => getPreviousPing(insertId)).then(props => fillCumalativeTablesParallel(props)).catch(e => console.error(e));

    // var last_track_id_rows;

    // let secondQuery = db.query('SELECT last_track_id FROM user_type_total WHERE \
    //       site_id = ? AND user_id = ? AND tracking_type = ?', [req.body.site_id, req.body.user_id,
    //     req.body.tracking_type
    // ]).then((rows) => {
    //     last_track_id_rows = rows;
    //     if (rows.length > 0) {
    //         return db.query('INSERT INTO user_type_total values \
    //             (?,?,?,?,?)',[req.body.site_id, req.body.user_id,
    //             req.body.tracking_type, 0, req.body.id]);
    //     }
    //     else {
    //         return false;
    //     }
    // }).then(() => {
    //     // if(entry_exists)
    // })




    // let secondQuery = new Promise((resolve, reject) => {

    // var query_string = mysql.format('SELECT last_track_id FROM user_type_total WHERE \
    //   site_id = ? AND user_id = ? AND tracking_type = ?', [req.body.site_id, req.body.user_id,
    //     req.body.tracking_type
    // ]);

    //     console.log(query_string);

    //     pool.query(
    //         query_string,
    //         function(error, results, fields) {
    //             if (error) {
    //                 reject(error)
    //             }
    //             else {
    //                 console.log(results)
    //                 resolve(results);
    //             }
    //         }


    //     )
    // });

    // let second_follow = secondQuery.then((results) => {
    //     var query_string = mysql.format('SELECT')
    //     if (results.length <= 0) {
    //         pool.query()
    //     }
    // });


    // Promise.all([firstQuery])
    //     .then((results) => {
    res.status(200);
    res.json({ status: "ok" })
    //     })
    //     .catch((err) => {
    //         res.status(400);
    //         res.json({ status: 'fail' })
    //     });


});

module.exports = router;
