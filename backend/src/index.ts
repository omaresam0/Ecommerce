import (`dotenv/config`);
import express from 'express';
import mongoose from 'mongoose';
import userRoute from "./routes/userRoute.js"
import productRoute from "./routes/productRoute.js"
import cartRoute from "./routes/cartRoute.js";
import {seedInitialProducts} from "./services/productService.js"

const app = express()
const port = 3001;
app.use(express.json());
mongoose.connect(process.env.DATABASE_URL || ``).then( () => console.log("Mongo connected!"))
.catch((err) => console.log("Failed to connect!", err));

// seed the initial products
seedInitialProducts();

app.use('/user', userRoute);
app.use('/product', productRoute);
app.use('/cart', cartRoute);
app.listen(port, () => {
    console.log(`Serveris running at ${port}`);
})
