import express from 'express';
import mongoose from 'mongoose';
import userRoute from "./routes/userRoute.js"
import productRoute from "./routes/productRoute.js"
import {seedInitialProducts} from "./services/productService.js"

const app = express()
const port = 3001;
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/ecommerce").then( () => console.log("Mongo connected!"))
.catch((err) => console.log("Failed to connect!", err));

// seed the initial products
seedInitialProducts();

app.use('/user', userRoute);
app.use('/product', productRoute);

app.listen(port, () => {
    console.log(`Serveris running at ${port}`);
})
