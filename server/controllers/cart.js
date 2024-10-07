const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');


const getAllProductsFromCart = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: 'No token, authorization denied' });
  
  // user instance id
  const userId = req.user._id;
  try {
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const cart = await Cart.findById(customer.cart).populate('items.product');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const addOneProductToCart = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: 'No token, authorization denied' });

  const userId = req.user._id;
  const { productId } = req.params;

  try {
    const customer = await Customer.findById(userId);
    const product = await Product.findById(productId);

    if (!customer || !product) {
      return res.status(404).json({ message: 'Customer or Product not found.' });
    }

    if (product.quantity < 1) {
      return res.status(404).json({ message: 'Insufficient product quantity.' });
    }

    let cart = await Cart.findById(customer.cart).populate('items.product');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    const existingProductIndex = cart.items.findIndex(item => item.product.equals(productId));

    if (existingProductIndex !== -1) {
      if ( cart.items[existingProductIndex].quantity >= product.quantity) {
        return res.status(400).json({ message: 'Insufficient product quantity.' });
      }
      cart.items[existingProductIndex].quantity += 1;
    } else {
      cart.items.push({ product: product, quantity: 1 });
    }

    cart.totalPrice += product.price;

    await cart.save();

    res.status(201).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const updateOneProductInCart = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: 'No token, authorization denied' });

  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  console.log(req.body);

  try {
    const product = await Product.findById(productId);
    const customer = await Customer.findById(userId);

    if (!quantity || quantity < 1) {
      return res.status(404).json({ message: 'Please input valid quantity.' });
    }

    if (product.quantity < quantity) {
      return res.status(404).json({ message: 'Insufficient product quantity.' });
    }

    if (!customer || !product) {
      return res.status(404).json({ message: 'Customer or Product not found.' });
    }

    let cart = await Cart.findById(customer.cart).populate('items.product');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    const existingProductIndex = cart.items.findIndex(item => item.product.equals(productId));

    if (existingProductIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }
    const oldQuantity = cart.items[existingProductIndex].quantity;
    cart.items[existingProductIndex].quantity = quantity;

    cart.totalPrice += product.price * (quantity - oldQuantity);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteOneProductInCart = async (req, res) => {
  if (!req.user || req.user === 'Vendor')
    return res.status(401).json({ message: 'No token, authorization denied' });

  const userId = req.user._id;
  const { productId } = req.params;

  try {
    const customer = await Customer.findById(userId);
    const product = await Product.findById(productId);

    if (!customer || !product) {
      return res.status(404).json({ message: 'Customer or Product not found.' });
    }

    const cart = await Cart.findById(customer.cart).populate('items.product');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const existingProductIndex = cart.items.findIndex(item => item.product.equals(productId));

    if (existingProductIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    const oldQuantity = cart.items[existingProductIndex].quantity;

    const updatedItems = cart.items.filter(item => !item.product.equals(productId));
    cart.items = updatedItems;


    cart.totalPrice -= product.price * oldQuantity;

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllProductsFromCart,
  addOneProductToCart,
  updateOneProductInCart,
  deleteOneProductInCart
};
