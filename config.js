const timeout = 1200000 //time out in milliseconds 

//connecttion Information 

const connectionInfo = {
    connectionLimit: 20,    //Number of parallel connections to the SQL server
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'teamie'
}

const config = {
    timeout: timeout,
    connectionInfo: connectionInfo
}

module.exports = config;
