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
    const { name, category, price, description, image, ingredients, recommendedFor, details } = req.body;
    
    // Create new product
    const newProduct = new Product({
      name,
      category,
      price,
      description,
      image,
      ingredients,
      recommendedFor,
      details
    });
    
    // Save product to database
    const savedProduct = await newProduct.save();
    
    // Create initial rating document with minimum valid rating
    const initialRating = new Rating({
      productId: savedProduct._id,
      rating: 1  // Set to minimum valid rating instead of 0
    });
    await initialRating.save();
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  try {
    console.log("Received update request with data:", req.body);
    
    // Extract data from request body
    const { name, category, price, description, image, ingredients, recommendedFor, details } = req.body;
    
    // Construct update object with data validation
    const updateData = {
      name: name || '',
      category: category || '',
      price: parseFloat(price) || 0,
      description: description || '',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      recommendedFor: Array.isArray(recommendedFor) ? recommendedFor : [],
      details: Array.isArray(details) ? details : []
    };
    
    // Only update image if provided
    if (image) {
      updateData.image = image;
    }
    
    console.log("Updating product with processed data:", updateData);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated document
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log("Product updated successfully:", updatedProduct);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Also delete related ratings and comments
    await Rating.deleteMany({ productId: req.params.id });
    await Comment.deleteMany({ productId: req.params.id });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
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