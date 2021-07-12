const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// create post
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (e) {
    res.status(500).json(e);
  }
});

// update post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(201).json('Post updated successfully');
    } else {
      res.status(403).json('access denied, or unavailable post');
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

// delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(201).json('Post deleted successfully');
    } else {
      res.status(403).json('access denied, or unavailable post');
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

// like/dislike post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(201).json('Post liked properly');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(201).json('Post disliked properly');
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json(e);
  }
});

// get timeline posts
router.get('/timeline/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

// get user's all posts (profile page)
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
