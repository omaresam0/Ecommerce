import express from "express";
import {addItemToCart, clearCart, deleteItemInCart, getActiveCart, updateItemInCart} from "../services/cartService.js";
import {validateJWT} from "../middlewares/validateJWT.js";
import type { ExtendedRequest } from "../types/extendedRequests.js";

const router = express.Router();

router.get("/", validateJWT, async(req: ExtendedRequest, res) => {
        const userId = req?.user?._id;
        const cart = await getActiveCart({ userId });
        res.status(200).send(cart);
    
});

router.post("/items", validateJWT ,async(req: ExtendedRequest, res) => {
        const userId = req?.user?._id;
        const { productId, quantity } = req.body; 
        const response = await addItemToCart({ userId, productId, quantity})
        res.status(response.statusCode).send(response.data);
})


router.put('/items', validateJWT, async(req: ExtendedRequest, res) => {
        try{
        const userId = req?.user?._id;
        const { productId, quantity } = req.body;
        const response = await updateItemInCart({ userId, productId, quantity });
        res.status(response.statusCode).send(response.data);
        } catch {
                res.status(500).send("Something went wrong!");
                
        }
});

router.delete('/', validateJWT, async(req: ExtendedRequest, res) => {
        const userId = req?.user?._id;
        const response = await clearCart({userId})
         res.status(response.statusCode).send(response.data);
       
})

router.delete('/items/:productId', validateJWT, async(req: ExtendedRequest, res) => {
        const userId = req?.user?._id;
        const {productId} = req.params; // retrieved from the path
        const response = await deleteItemInCart({userId, productId
        }); // pass the retrieved vars from the resoponse
        res.status(response.statusCode).send(response.data);
});

export default router;