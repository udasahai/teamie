var mysql = require('mysql');
var config = require('./config.js')
var pool = mysql.createPool(config.connectionInfo);

const db = {

  query(sql, args) {
    // console.log("Executing Query : " + mysql.format(sql, args));
    return new Promise((resolve, reject) => {
      pool.query(sql, args, (err, result) => {
        if (err)
          return reject(err);
        resolve(result);
      });
    });
  }

}


module.exports = db;
