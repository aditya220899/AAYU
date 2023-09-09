const express = require('express');
const router =express.Router()
const MyControllers = require('../Controllers/Controllers')

router.get('/', MyControllers.getApi)
router.post('/add-user' , MyControllers.RegisterUser)
router.post('/login-user' , MyControllers.loginUser)
router.post('/add-product' , MyControllers.addProduct)
router.get('/get-products', MyControllers.getAllProducts)
router.post('/add-to-cart', MyControllers.addToCart)
router.get('/get-cart-count' , MyControllers.getCartCountByUserID)
router.get('/get-cart-with-products' , MyControllers.getCartProducts)
router.get('/get-cart-with-products-2' , MyControllers.getCartProducts2)
router.post('/update-cart-quantity' , MyControllers.updateCartQuantity)
router.post('/update-addresses' , MyControllers.addAddress)
router.get('/remove-cart-item' , MyControllers.RemoveItemFromCart)
router.get('/get-user-addresses' , MyControllers.getUserAddresses)
router.post('/place-order' , MyControllers.addOrder)

module.exports = router
