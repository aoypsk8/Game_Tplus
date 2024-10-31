// // db.js (or in your main server file)
// const mysql = require('mysql2');

// // Create a connection pool
// const pool = mysql.createPool({
//   host: 'localhost',       // Replace with your MySQL host
//   user: 'root',            // Replace with your MySQL username
//   password: '',    // Replace with your MySQL password
//   database: 'test',  // Replace with your MySQL database name
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Export the pool for use in other parts of the application
// module.exports = pool.promise();

const sql = require('mssql');
const config = {
  user: "userltc",
  password: "Ltc@20245",
  server: "172.28.17.100",
  database: "MBAPP",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Connect to SQL Server once and reuse connection pool
const poolPromise = sql.connect(config).then(pool => {
  console.log('Connected to SQL Server');
  return pool;
}).catch(err => console.error('Database Connection Failed:', err));

module.exports = {
  sql,
  poolPromise
};