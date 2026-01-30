import express, { request } from "express";
import { getAllProducts } from "../services/productService.js";

const router = express.Router();

router.get('/', async(req, res) => {
    const products = await getAllProducts();
    res.status(200).send(products);
})

export default router;