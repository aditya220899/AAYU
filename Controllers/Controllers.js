const ProductSchema = require('../Schemas/ProductSchema');
const UserSchema = require('../Schemas/UserSchema');
const bcrypt = require('bcrypt');
const CartSchema = require('../Schemas/CartSchema');
const OrdersSchema = require('../Schemas/OrdersSchema')


exports.getApi = (req, res) => {
    

}

exports.RegisterUser = (req, res) => {
    const { name, email, mobile, address, password, gender } = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
        }

        else {
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    res.status(400).send({ status: 400, message: "Something went wrong !! Please, Try Again" })
                }

                else {
                    UserSchema.insertMany({ name: name, address: address, email: email, mobile: mobile, password: hash, gender: gender }).then((result) => {
                        console.log(result)


                        if (result.length > 0) {
                            res.status(200).send({ status: 200, message: "User Registered Successfully" })
                        }

                        else {
                            res.status(400).send({ status: 400, message: "Something went wrong !! Please, Try Again" })
                        }


                    }).catch((err) => {


                        if (err.name == 'ValidationError') {
                            res.status(400).send({ status: 400, message: `${err.message.split('Path')[1]}` })
                        }

                        else if (err.name == 'MongoBulkWriteError' && err.code == 11000) {
                            res.status(400).send({ status: 400, message: `User Already Exists with ${err.message.split('{')[1].replace('}', '')}` })
                        }

                        else {
                            res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
                        }
                    })
                }
            })
        }
    })



}


exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    UserSchema.find({ email: email }).then((result) => {
        console.log(result)
        if (result.length > 0) {

            bcrypt.compare(password, result[0].password, function (err, status) {
                if (err) {
                    res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
                }
                else {
                    if (status == true) {
                        res.status(200).send({ status: 200, message: "Login Successful", data: result[0] })
                    }

                    else {
                        res.status(400).send({ status: 400, message: "Incorrect Password" })
                    }
                }
            })
        }
        else {
            res.status(400).send({ status: 400, message: "User Not Found!! Register First" })
        }
    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
    })


}

exports.getUserAddresses = (req,res) =>{

    const {u_id }  = req.query;

    UserSchema.find({_id : u_id}).then((result1)=>{
        if(result1.length > 0)
        {


            if(Array.isArray(result1[0]['all_addresses']) && result1[0]['all_addresses'].length > 0)
            {
               ////console.log("A")
                res.status(200).send({status : 200 , message : "Adrress Found", data : result1[0]['all_addresses']  })
            }
            else
            {
               ////console.log("B")

                res.status(400).send({status : 400 , message : "No Address Found to Deliver"  })

            }
        }
        else
        {
            res.status(400).send({status :  400 , message : "Something Went Wrong !! Please Try Again"})

        }
    }).catch((err)=>{
        res.status(500).send({status :  500 , message : "Something Went Wrong !! Please Try Again"})

    })

}


exports.addAddress = (req,res) =>{
    const {u_id , addresses }  = req.body;

    UserSchema.updateOne({_id : u_id } , {$set : {  all_addresses :   addresses    }}).then((data2)=>{

        if(data2.modifiedCount == 1)
        {
            res.status(200).send({status :  200 , message : "Updated Successfully"})

        }
        else
        {
            res.status(400).send({status :  400 , message : "Not Updated !! Please Try Again"})

        }


    }).catch((err)=>{
        res.status(400).send({status :  400 , message : "Something Went Wrong !! Please Try Again"})

    })
  

}

exports.addToCart = (req, res) => {
    const { u_id, p_id, quantity } = req.body
    CartSchema.insertMany({ u_id: u_id, p_id: p_id, quantity: quantity }).then((result) => {
        if (result.length > 0) {
            res.status(200).send({ status: 200, message: "Product added to Cart" })
        }
        else {
            res.status(400).send({ status: 400, message: "Product not added to Cart" })
        }
    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
    })

}

exports.updateCartQuantity = (req, res) => {
    var { c_id, type } = req.body;

    CartSchema.find({ _id: c_id }).then((data1) => {

        if (data1.length > 0) {


            if (type == "INCRE") {


                CartSchema.updateOne({ _id: c_id }, { $set: { quantity: data1[0].quantity + 1 } }).then((data2) => {

                    if (data2.modifiedCount == 1) {
                        res.status(200).send({ status: 200, message: "Updated Successfully" })

                    }
                    else {
                        res.status(400).send({ status: 400, message: "Not Updated !! Please Try Again" })

                    }


                }).catch((err) => {
                    res.status(400).send({ status: 400, message: "Something Went Wrong !! Please Try Again" })

                })

            }
            else {

                ////console.log("Quantity" , data1[0].quantity > 1)
                if (type == 'DECRE' && data1[0].quantity > 1) {


                    CartSchema.updateOne({ _id: c_id }, { $set: { quantity: data1[0].quantity - 1 } }).then((data2) => {

                        if (data2.modifiedCount == 1) {
                            res.status(200).send({ status: 200, message: "Updated Successfully" })

                        }
                        else {
                            res.status(400).send({ status: 400, message: "Not Updated !! Please Try Again" })

                        }


                    }).catch((err) => {
                        res.status(400).send({ status: 400, message: "Something Went Wrong !! Please Try Again" })

                    })
                }
                else {

                    CartSchema.deleteOne({ _id: c_id }).then((data3) => {
                        ////console.log(data3)
                        if (data3.deletedCount == 1) {

                            res.status(200).send({ status: 200, message: "Product Removed Successfully" })
                        } else {
                            res.status(400).send({ status: 400, message: "Unable to Remove Product !! Please Try Again" })

                        }


                    }).catch((err) => {
                        res.status(400).send({ status: 400, message: "Something Went Wrong !! Please Try Again" })

                    })


                }
            }

        }
        else {
            res.status(400).send({ status: 400, message: "Something Went Wrong !! Please Try Again" })

        }

    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something Went Wrong !! Please Try Again" })

    })




}

exports.getCartCountByUserID = (req, res) => {
    ////console.log(req.query)
    const { u_id } = req.query

    CartSchema.find({ u_id: u_id }).then((result) => {
        ////console.log(result)
        if (result.length > 0) {
            res.status(200).send({ status: 200, data: result, count: result.length, message: "Success" })

        }
        else {
            res.status(200).send({ status: 200, data: result, count: result.length, message: "Something Went Wrong || Please Try Again" })

        }
    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something Went Wrong || Please Try Again" })

    })

}

async function getProductFromID(id) {

    var pd = await ProductSchema.find({ _id: id });
    // ////console.log("PD" , pd)
    return pd[0]


}

exports.getCartProducts = async (req, res) => {
    const { u_id } = req.query;
    CartSchema.find({ u_id: u_id }).then((c_result) => {
        var cart_arr = c_result;
        ////console.log(c_result.length)



        if (cart_arr.length > 0) {


            ProductSchema.find({}).then((pr_res) => {
                var new_data = []
                if (pr_res.length > 0) {

                    for (let i = 0; i < c_result.length; i++) {
                        // ////console.log("A")
                        for (let j = 0; j < pr_res.length; j++) {
                            // ////console.log("B")
                            if (c_result[i].p_id == pr_res[j]._id) {
                                // ////console.log("C")
                                new_data.push({ ...c_result[i]._doc, pro_data: pr_res[j] })
                                // ////console.log(new_data)
                            }
                        }
                    }

                    res.status(200).send({ status: 200, data: new_data, count: cart_arr.length, message: "Success" })

                }
                else {
                    res.status(200).send({ status: 200, data: [], count: 0, message: "Something Went Wrong || Please Try Again" })

                }
            }).catch((err) => {
                res.status(500).send({ status: 500, message: "Something Went Wrong || Please Try Again" })

            })




        }
        else {
            res.status(400).send({ status: 400, data: [], count: 0, message: "Something Went Wrong || Please Try Again" })

        }

    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something Went Wrong || Please Try Again" })

    })
}

exports.getCartProducts2 = async (req, res) => {
    var data_final = []
    try {

        const { u_id } = req.query;

        // Call the first API (api1)
        const response1 = await CartSchema.find({ u_id: u_id });
        const data1 = response1;
        for (let i = 0; i < data1.length; i++) {
            data_final.push({ ...data1[i]._doc, pro_data: {} })
            const response2 = await ProductSchema.findOne({ _id: data1[i].p_id });
            const data2 = response2;
            // ////console.log("Data-2" , data2)
            data_final[i].pro_data = data2

        }
        res.status(200).send({ data: data_final })



    } catch (err) {
        ////console.log(err)
        res.status(500).send({ status: 500, message: "Something Went Wrong || Please Try Again" })

    }

}



exports.addProduct = (req, res) => {

    const { p_name, price, image, category, discount } = req.body;

    ProductSchema.insertMany({ p_name: p_name, price: price, image: image, category: category, discount: discount }).then((result) => {
        if (result.length > 0) {
            res.status(200).send({ status: 200, message: "Product added successfully" })
        }
        else {
            res.status(400).send({ status: 400, message: "Product not Added !! Try Again" })
        }
    }).catch((err) => {
        res.status(500).send({ status: 500, message: "Something went wrong !! Please, Try Again" })
    })
}

exports.RemoveItemFromCart = (req,res) =>{
    const {c_id} =  req.query
    CartSchema.deleteOne({_id : c_id}).then((data3)=>{
        ////console.log(data3)
        if(data3.deletedCount == 1)
        {

            res.status(200).send({status :  200 , message : "Product Removed Successfully"})
        }else
        {
            res.status(400).send({status :  400 , message : "Unable to Remove Product !! Please Try Again"})

        }


    }).catch((err)=>{
        res.status(500).send({status :  500 , message : "Something Went Wrong !! Please Try Again"})

    })


}

exports.addOrder = (req,res) =>{

    const {u_id , order_data } =  req.body;
    var ordn = Math.floor(Math.random() * 167859456).toString().padStart(6, 0);
    
    
    OrdersSchema.insertMany({u_id : u_id , o_data : order_data , ord_number : ordn}).then((result1)=>{
    
    
        console.log(order_data)
    
        
    
       
        if(result1.length > 0)
        {
    
            CartSchema.deleteMany({u_id : u_id}).then((re_2)=>{
    
               //console.log(re_2)
                if(re_2.deletedCount > 0)
                {
                    
                        res.status(200).send({status : 200 , message : "Order Has Been Placed Successfully" })
                
                }else
                {
                    res.status(400).send({status: 400, message : "Order Not Placed || Try Again"})
    
                }
                    
            }).catch((err)=>{
               console.log(err)
                res.status(500).send({status :  500 , message : "Something Went Wrong !! Please Try Again"})
    
            })
    
        }
        else
        {
            res.status(400).send({status: 400, message : "Order Not Placed || Try Again"})
    
        }
    }).catch((err)=>{
       console.log(err)
        res.status(500).send({status :  500 , message : "Something Went Wrong !! Please Try Again"})
    
    })
    
    
    
    
    }





exports.getAllProducts = (req, res) => {

    ProductSchema.find({}).then((result) => {
        res.status(200).send({ status: 200, data: result })
    }).catch((err) => {
        res.status(500).send({ status: 500, data: [] })
    })
}









