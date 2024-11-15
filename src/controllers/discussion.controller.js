const Discussion = require('../models/discussion.model');

exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, relatedMovie, relatedPerson, tags } = req.body;
    
    const discussion = await Discussion.create({
      title,
      content,
      author: req.user._id,
      category,
      relatedMovie,
      relatedPerson,
      tags
    });

    res.status(201).json({
      status: 'success',
      data: { discussion }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    const { category, movieId, personId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) query.category = category;
    if (movieId) query.relatedMovie = movieId;
    if (personId) query.relatedPerson = personId;

    const discussions = await Discussion.find(query)
      .populate('author', 'username')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Discussion.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        discussions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.comments.push({
      author: req.user._id,
      content
    });
    await discussion.save();

    res.status(201).json({
      status: 'success',
      data: { discussion }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};