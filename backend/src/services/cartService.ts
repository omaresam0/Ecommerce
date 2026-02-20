import { cartModel, type ICart, type ICartItem } from "../models/cartModel.js";
import { orderModel, type IOrderItem } from "../models/orderModel.js";
import productModel from "../models/productModel.js";


interface CreateCart {
    userId: String;
}


const createCart = async ({ userId }: CreateCart) => {
    const cart = await cartModel.create({userId, totalAmount: 0});
    await cart.save();
    return cart;
}


interface GetActiveCart{
    userId: String;
}
export const getActiveCart = async({ userId }:GetActiveCart) => {
    let cart = await cartModel.findOne({userId, status:"active"})


    if(!cart){
        cart = await createCart({userId});
    }
    return cart;
};


interface AddItemToCart{
    userId: string;
    productId: any;
    quantity: number;
}


export const addItemToCart = async({ productId, quantity, userId }: AddItemToCart) => {
    const cart = await getActiveCart({ userId });


    // item exist in cart?
    const existsInCart = cart.items.find((p) => p.product.toString() === productId);


    if(existsInCart){
        return { data: "Item  already exists in cart!", statusCode: 400 };
    }


    // Fetch product
    const product = await productModel.findById(productId);


    if(!product){
         return { data: "Product not found!", statusCode: 400 };
    }


    cart.items.push({ product: productId,
         unitPrice: product.price,
         quantity });


        cart.totalAmount += product.price * quantity;


        if(product.stock < quantity){
            return { data: "Low stock for item", statusCode: 400 };
        }


        const updateCart = await cart.save();
        return { data: updateCart, statusCode: 201 };
     }


     interface UpdateItemInCart{
        productId: any;
        quantity: number;
        userId: string;
     }
     export const updateItemInCart = async({ productId,quantity, userId }: UpdateItemInCart) => {
   
    const cart = await getActiveCart({userId});
   
    const existsInCart = cart.items.find((p) => p.product.toString() === productId
     );


     if(!existsInCart){
        return{ data: "Item does not exist in cart", statusCode: 400 };
     }


   
   const product = await productModel.findById(productId);


    if(!product){
         return { data: "Product not found!", statusCode: 400 };
    }


    if(product.stock < quantity){
    return { data: "Low stock for item", statusCode: 400 };
    }


     existsInCart.quantity = quantity;


     // get other items than the one we just added
     const otherCartItems = cart.items.filter((p) => p.product.toString() != productId);



     // total price for other cart items
    let total = calculateCartTotalItems({cartItems:otherCartItems});


     // total + existing item we updated
     total += existsInCart.quantity * existsInCart.unitPrice;
     cart.totalAmount = total;


    const updateCart = await cart.save();


       return {
             data: updateCart, statusCode: 200
        };
}


    interface DeleteItemInCart{
        userId: string;
        productId: any;
    }


    export const deleteItemInCart = async({productId, userId} : DeleteItemInCart) => {
        const cart = await getActiveCart({userId});
       
        // item exist in cart?
        const existsInCart = cart.items.find((p) => p.product.toString() === productId);


        if(!existsInCart){
            return { data: "Item  does not exist in cart!", statusCode: 400 };
        }


        // get other items than the one is being deleted
        const otherCartItems = cart.items.filter((p) => p.product.toString() != productId);


        let total = calculateCartTotalItems({cartItems:otherCartItems});



        cart.items = otherCartItems;
        cart.totalAmount = total;


        const updateCart = await cart.save();
        return { data: updateCart, statusCode: 201 };
       
    }


    const calculateCartTotalItems = ({cartItems} : { cartItems: ICartItem[];}) => {


        let total = cartItems.reduce((sum, product) => {
        sum+= product.quantity * product.unitPrice;
        return sum;
     }, 0);


     return total;
    }


    interface Clearcart {
         userId: string;
}


export const clearCart = async({userId}:Clearcart) => {
        const cart = await getActiveCart({userId});
        cart.items = [];
        cart.totalAmount = 0;


        const updatedCart = await cart.save();


        return { data: updatedCart, statusCode: 200 }
}


interface Checkout{
    userId: string;
    address: string
}


export const checkout = async({userId, address} : Checkout) => {
       
        if(!address){
            return { data: "Please add the address", statusCode: 400 };
        }


        const cart = await getActiveCart({ userId });
       
        const orderItems: IOrderItem[] = [];
           
        //Looping through cart items and creating order items
        for(const item of cart.items){
            const product = await productModel.findById(item.product) // product here represents the product id


            if(!product){
                return { data: "Product not found", statusCode: 400 }
            }


            const orderItem: IOrderItem = {
                productTitle: product.title,
                productImage: product?.image,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }
            orderItems.push(orderItem)
        }


        const order = await orderModel.create({
            orderItems,
            total: cart.totalAmount,
            address,
            userId,
        });


        await order.save();


       // update cart status to be completed
       cart.status = "completed";
       await cart.save();


       return { data: order, statusCode: 200 };
}