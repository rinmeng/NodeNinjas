const { Pool } = require('pg');

const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'root',
    password: 'rootpw',
    database: 'ctms'
});

module.exports = pool;