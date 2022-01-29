// grabs our client with destructuring from the export in index.js
const { client, getAllUsers, createUser, updateUser, getUserbyId, 
  createPost, updatePost, getAllPosts, getPostsByUser, 
  addTagsToPost, createTags, getPostsByTagName } = require('./index');
const { users } = require('./seedData')

// this function should call a query that dops all the tables from our databse
const dropTables = async () => {
    try {
        console.log('starting to drop tables...')
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `)
        console.log('finished dropping tables!')
    } catch(error) {
        console.error('error dropping tables!')
        throw error;  // we pass the error up to the function that calls dropTables
    }
}

// this function calls a query which creates all tables for our database
const createTables = async () => {
    try {
        console.log('starting to build tables...')
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
                "authorId" INTEGER REFERENCES users(id), 
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );

            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );

            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id), 
                UNIQUE ("postId", "tagId")
            );

        `);
        console.log('finished building tables!')
    } catch(error) {
        console.error('error building tables!')
        throw error; // pass the error up to the function that calls createTables
    }
}

const createInitialUser = async () => {
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

const createInitialPosts = async () => {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log("starting to create posts...")
        await createPost({
            authorId: albert.id, 
            title: "First Post", 
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["#happy", "#youcandoanything"]
        });
        await createPost({
          authorId: sandra.id,
          title: "How does this work?",
          content: "Seriously, does this even do anything?",
          tags: ["#happy", "worst=day-ever"]
        });
    
        await createPost({
          authorId: glamgal.id,
          title: "Living the Glam Life",
          content: "Do you even? I swear that half of you are posing.",
          tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });
        console.log("Finished creating posts!");
    } catch(error) {
        throw error;
    }
}

const rebuildDB = async () => {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUser();
        await createInitialPosts();
    } catch(error) {
        console.log("error during rebuildDB")
        throw error;
    } 
}

const testDB = async () => {
    try {
        console.log('starting to test database...')

        console.log('calling getAllUsers')
        const users = await getAllUsers();
        console.log("getAllUsers: ", users)

        console.log('calling updateUser on users[0]')
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        })
        console.log('result: ', updateUserResult);
        
        console.log('calling getAllPosts');
        const posts = await getAllPosts();
        console.log('getAllPosts: ', posts);

        console.log('calling updatePost on posts[0]');
        const updatedPostResult = await updatePost(posts[0].id, {
            title: "new title",
            content: "updated content"
        });
        console.log('results: ', updatedPostResult);
        
        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log('calling getPostsByTagName with #happy');
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result: ", postsWithHappy)

        console.log('finished database test!')
    } catch (error) {
        console.error('error testing database!')
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end())