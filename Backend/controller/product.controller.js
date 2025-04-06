import { Product, Rating, Comment } from '../model/product.model.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { name, category, price, description, image, ingredients, details } = req.body;
    
    // Create new product
    const newProduct = new Product({
      name,
      category,
      price,
      description,
      image,
      ingredients,
      details
    });
    
    // Save product to database
    const savedProduct = await newProduct.save();
    
    // Create initial rating document (optional)
    const initialRating = new Rating({
      productId: savedProduct._id,
      rating: 0 // Initial rating (can be set to 0 or null based on your requirements)
    });
    await initialRating.save();
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Fetch product details by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details', error });
  }
};

// Fetch product rating by ID
export const getProductRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ productId: req.params.id });
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    res.status(200).json(rating);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product rating', error });
  }
};

// Add a new comment and rating
export const addComment = async (req, res) => {
  try {
    const { userName, text, rating } = req.body;
    const newComment = new Comment({
      productId: req.params.id,
      userName,
      text,
      rating,
    });
    await newComment.save();
    
    // Update the overall product rating (average of all comments)
    const allComments = await Comment.find({ productId: req.params.id });
    const totalRating = allComments.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / allComments.length;
    
    // Find and update the rating document
    let ratingDoc = await Rating.findOne({ productId: req.params.id });
    if (ratingDoc) {
      ratingDoc.rating = averageRating;
      await ratingDoc.save();
    } else {
      // Create a new rating document if it doesn't exist
      ratingDoc = new Rating({
        productId: req.params.id,
        rating: averageRating
      });
      await ratingDoc.save();
    }
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
};

// Fetch all comments for a product
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.id });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};