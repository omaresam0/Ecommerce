import productModel from "../models/productModel.js";

export const getAllProducts = async () => {
    return await productModel.find();
}

export const seedInitialProducts = async () => {

    try{
    const products = [
            { title: "Product 1", image: "https://m.media-amazon.com/images/I/41Dg9haNatL.jpg", price: 10, stock: 100 },
            { title: "Product 2", image: "image2.jpg", price: 13, stock: 11 },
            { title: "Product 3", image: "image3.jpg", price: 30, stock: 33 },
            { title: "Product 4", image: "image4.jpg", price: 40, stock: 2 },
            { title: "Product 5", image: "image5.jpg", price: 17, stock: 54 },
            { title: "Product 6", image: "image6.jpg", price: 13, stock: 32 },
            { title: "Product 7", image: "image7.jpg", price: 12, stock: 12 },
            { title: "Product 8", image: "image8.jpg", price: 9, stock: 1 },
            { title: "Product 9", image: "image9.jpg", price: 34, stock: 11 },
            { title: "Product 10", image: "image10.jpg", price: 22, stock: 33 },
        ];

        const existsingProducts = await getAllProducts();

        if(existsingProducts.length == 0){
            await productModel.insertMany(products);
        }
    } catch(err){
        console.error("can not seed database", err)
    }
 
}