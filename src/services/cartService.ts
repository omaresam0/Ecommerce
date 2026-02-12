import { cartModel, type ICart, type ICartItem } from "../models/cartModel.js";
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
     // sum is the number param, product is the objec of items in cart param
     // reduce is like an iterator that iterate over product, and initially start the sume with 0
    let total = calculateCartTotalItems({cartItems:otherCartItems});

     // total + existing item we updated
     total += existsInCart.quantity * existsInCart.unitPrice; 
     cart.totalAmount = total;

    const updateCart = await cart.save();

       return {
             data: updateCart, statusCode: 200
        };

     // we could also have did it another way, by subtracting total amount from the current item's amount then adding the new amount over the subtracted one
     //e.g: p1 is 10$, total cart is 40$, so total is 30$ without the 10$, then since we updated p1 to quantity 2, then it is 10*2=20$. now, add 20$ to 30$ to be 50$. However the way we did it might be beneficial if we later wanted to make the updatecartitem func take multiple items to update at once, so the total is easier instead of subtracting each product we updated from the cart total amount
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