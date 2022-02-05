// /api/posts
const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils')

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");
    next();
  });

// GET '/api/posts'
postsRouter.get('/', async (req, res) => { 
  const posts = await getAllPosts();
  res.send({
    posts
  });
})

// POST '/api/posts'
// first function requireUser to check if user exists then comes back here
postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body;
  if (!title || !content) {
    next({
      name: "missingField",
      message: "Title and content is required"
    })
  }
  const { id: authorId } = req.user
  console.log('req.user: ', req.user)
  const postData = {};

  // if there are tags 
  if (tags.length) {
    const tagArray = tags.trim().split(/\s+/)
    postData.tags = tagArray;
  }
  try {
    const newPostData = {...postData, authorId, title, content}
    console.log('new post: ', newPostData)
    const post = await createPost(newPostData)
    if (post) {
    res.send(post);
    };
  } catch ({ name, message}) {
    next({ name, message })
  }
})

// PATCH /api/posts/:postId
postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body; 

  const updateFields = {} ;

  if (tags && tags.length > 0) {
    //adding tags as an array to object updateFields as key and values
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content; 
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({post: updatedPost})
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message }); 
  }
});

module.exports = postsRouter;