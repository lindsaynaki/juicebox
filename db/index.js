const { Client } = require('pg'); // imports the pg module

// supply the db name and location of the database
const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    const { rows: users } = await client.query(
      `SELECT id, username 
      FROM users;
    `);
  
    return users;
  }

  async function createUser({ username, password }) {
    try {
      const { rows: [user] } = await client.query(`
        INSERT INTO users(username, password) 
        VALUES ($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
      `, [username, password]);
  
      return user
    } catch (error) {
      throw error;
    }
  }

  module.exports = {
    client,
    getAllUsers,
    createUser
  }
