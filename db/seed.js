const { client, getAllUsers, createUser, updateUser } = require('./index');
const { users } = require('./seed_data')

// this function should call a query which drops all tables from our database
async function dropTables() {
    try {
      await client.query(`
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls dropTables
    }
  }

  async function createTables() {
    try {
      await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
      );

      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      
      

      `);
    } catch (error) {
      throw error; // we pass the error up to the function that calls createTables
    }
  }

  async function createInitialUsers () {
      try {
          console.log("Starting to create users...");
          const newUsers = await Promise.all(users.map(createUser));
          console.log(newUsers);
          console.log("Finished creating users!");
      } catch(error) {
          console.error("Error creating users!")
          throw error;
      }
  }

  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
    } catch (error) {
      console.error(error);
    } 
  }

  async function testDB() {
    try {
      // connect the client to the database, finally
      console.log("Starting to test database...");
      // queries are promises, so we can await them
      const allUsers = await getAllUsers();
      console.log("getAllUsers:", allUsers);
      const updateUserResult = await updateUser(allUsers[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
      console.log("Finished database tests!");

    } catch (error) {
      console.error("Error testing database!");
      throw error
    } 
  }

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());