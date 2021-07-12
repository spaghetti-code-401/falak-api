const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        return res.status(500).json(e);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      });
      res.status(201).json('Account updated');
    } catch (e) {
      return res.status(500).json(e);
    }
  } else {
    return res.status(403).json('you can update only your account');
  }
});

// delete user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(202).json('Account deleted');
    } catch (e) {
      return res.status(500).json(e);
    }
  } else {
    return res.status(403).json('you can delete only your account');
  }
});

// get a user
// using query not params (to get by userId and by username)
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    // filtering password, and sending only the (other)
    const { password, updatedAt, ...other } = user._doc;
    !user && res.status(404).json('user does not exist');
    res.status(200).json(other);
  } catch (e) {
    res.status(500).json(e);
  }
});

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const toBeFollowedUser = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!toBeFollowedUser.followers.includes(req.body.userId)) {
        await toBeFollowedUser.updateOne({
          $push: { followers: req.body.userId }
        });
        await currentUser.updateOne({
          $push: { following: req.params.id }
        });
        res.status(200).json('user has been followed');
      } else {
        res.status(403).json('you already follow this user');
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json('you cannot follow yourself, hehehehe!');
  }
});

// unfollow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const toBeUnfollowedUser = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (toBeUnfollowedUser.followers.includes(req.body.userId)) {
        await toBeUnfollowedUser.updateOne({
          $pull: { followers: req.body.userId }
        });
        await currentUser.updateOne({
          $pull: { following: req.params.id }
        });
        res.status(200).json('user has been unfollowed');
      } else {
        res.status(403).json('you do not follow this user');
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json('you cannot unfollow yourself, no?');
  }
});

// get friends
router.get('/friends/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.following.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
