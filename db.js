const mysql = require('mysql2/promise')
// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'mysql-10c77f66-emman199810-8ec7.l.aivencloud.com',
  port:'19417',
  user: 'avnadmin',
  password:'AVNS_6JwxnghvxWxLwO8P7bI',
  database: 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool