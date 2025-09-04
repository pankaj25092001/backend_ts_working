import mysql from "mysql2/promise";
 
// Create a connection pool (better than single connection)
const pool = mysql.createPool({
  host: "localhost",       // because you mapped container port 3306 → localhost:3306
  user: "root",            // default MySQL root user
  password: "my-secret-pw",// same as in nerdctl run
  database: "mydb",        // created by container
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
 
export default pool;