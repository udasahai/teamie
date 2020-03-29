var mysql = require('mysql');
var db = require('../db.js');
const timeout = 1200 //time out in seconds 

let req;

const insertNewPing = async(request) => {

    req = request;

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

    ////console.log(insertId)
    const query_string = "SELECT * FROM track where user_id=? and id!=? ORDER BY id DESC LIMIT 1" //Get the previous ping, exlude the currently inserted one. 
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

    ////console.log(result)

    if (result.length == 0)
        return false;

    let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
    let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 

    if (time_bw_pings > timeout)
        return false;


    return await Promise.all([fillUserTypeTotal(props), fillUserGroupEntityTotal(props), fillUserGroupTypeTotal(props)])

}


const fillUserTypeTotal = async(props) => {

    let result = props.result;
    let insertId = props.insertId;

    let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
    let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 


    //See if we can fill table 2 by comparing the site_id, user_id and tracking_type fields
    if (req.body.user_id == result[0].user_id && req.body.site_id == result[0].site_id && req.body.tracking_type == result[0].tracking_type) {

        // ////console.log("same tracking type")
        let query_string = `SELECT total_time FROM user_type_total
                                    WHERE site_id = ? and user_id = ? and tracking_type = ?`
        let args = [req.body.site_id, req.body.user_id, req.body.tracking_type]
        // ////console.log(mysql.format(query_string, args))
        let res = await db.query(query_string, args);
        let prev_time = 0;

        if (res.length > 0)
            prev_time = res[0].total_time;

        // ////console.log("Prev entry exists")

        let total_time = prev_time + time_bw_pings;

        query_string = `INSERT INTO user_type_total VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE ?`;
        args = [req.body.site_id, req.body.user_id, req.body.tracking_type, total_time, insertId, { last_track_id: insertId, total_time: total_time }]
        return await db.query(query_string, args);
    }

    return false;
}

const fillUserGroupEntityTotal = async(props) => {

    let result = props.result;
    let insertId = props.insertId;

    let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
    let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 


    //See if we can fill table 2 by comparing the site_id, user_id and tracking_type fields
    if (req.body.user_id == result[0].user_id && req.body.site_id == result[0].site_id && req.body.entity_type == result[0].entity_type &&
        req.body.entity_id == result[0].entity_id && req.body.group_id == result[0].group_id) {

        ////console.log("same tracking type")
        let query_string = `SELECT total_time FROM user_group_entity_total
                                    WHERE site_id = ? and user_id = ? and group_id = ? and entity_type = ? and entity_id = ?`
        let args = [req.body.site_id, req.body.user_id, req.body.group_id, req.body.entity_type, req.body.entity_id]
        ////console.log(mysql.format(query_string, args))
        let res = await db.query(query_string, args);
        let prev_time = 0;

        if (res.length > 0)
            prev_time = res[0].total_time;

        ////console.log("Prev entry exists")

        let total_time = prev_time + time_bw_pings;

        query_string = `INSERT INTO user_group_entity_total VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ?`;
        args = [req.body.site_id, req.body.user_id, req.body.group_id, req.body.entity_type, req.body.entity_id,
            total_time, insertId, 0, { last_track_id: insertId, total_time: total_time }
        ]
        return await db.query(query_string, args);
    }

    return false;
}

const fillUserGroupTypeTotal = async(props) => {

    let result = props.result;
    let insertId = props.insertId;

    let prev_timestamp = parseInt(result[0].timestamp); //get the timestamp of the previous ping
    let time_bw_pings = parseInt(req.body.timestamp) - prev_timestamp //time between this ping and prev ping. 


    //See if we can fill table 2 by comparing the site_id, user_id and tracking_type fields
    if (req.body.user_id == result[0].user_id && req.body.site_id == result[0].site_id && req.body.tracking_type == result[0].tracking_type) {

        ////console.log("same tracking type")
        let query_string = `SELECT total_time FROM user_group_type_total
                                    WHERE site_id = ? and user_id = ? and group_id = ? and tracking_type = ?`
        let args = [req.body.site_id, req.body.user_id, req.body.group_id, req.body.tracking_type]
        ////console.log(mysql.format(query_string, args))
        let res = await db.query(query_string, args);
        let prev_time = 0;

        if (res.length > 0)
            prev_time = res[0].total_time;

        ////console.log("Prev entry exists")

        let total_time = prev_time + time_bw_pings;

        query_string = `INSERT INTO user_group_type_total VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ?`;
        args = [req.body.site_id, req.body.user_id, req.body.group_id, req.body.tracking_type, total_time, insertId, { last_track_id: insertId, total_time: total_time }]
        return await db.query(query_string, args);
    }

    return false;
}

const func = {
    insertNewPing: insertNewPing,
    getPreviousPing: getPreviousPing,
    fillCumalativeTablesParallel: fillCumalativeTablesParallel
}


module.exports = func;
