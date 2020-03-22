var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'teamie'
});

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
