const List = require('../models/list.model');

exports.createList = async (req, res) => {
  try {
    const { name, description, movies, isPublic } = req.body;
    
    const newList = await List.create({
      name,
      description,
      creator: req.user._id,
      movies,
      isPublic
    });

    res.status(201).json({
      status: 'success',
      data: { list: newList }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUserLists = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const lists = await List.find({
      $or: [
        { creator: userId },
        { isPublic: true }
      ]
    })
    .populate('movies', 'title coverImage')
    .skip(skip)
    .limit(limit);

    const total = await List.countDocuments({ creator: userId });

    res.status(200).json({
      status: 'success',
      data: {
        lists,
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

exports.followList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user._id;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (!list.followers.includes(userId)) {
      list.followers.push(userId);
      await list.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'List followed successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};