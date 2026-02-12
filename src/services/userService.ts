import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterParams{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export const register = async ({firstName,
    lastName,
    email,
    password } : RegisterParams) => {
    const findUser = await userModel.findOne({email}) 
    if(findUser){
        return { data: "User already exists", statusCode: 400 }
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ email, password: hashPassword, firstName, lastName } )
    await newUser.save();
    return { data: generateJWT({firstName, lastName, email}), statusCode: 200};
}

interface LoginParams {
    email: string;
    password: string;
}

export const login = async({email, password}: LoginParams) => {
    const findUser = await userModel.findOne({email})
    if(!findUser){
        return { data: { message: "Incorrect email or password!" }, statusCode: 400 };
    }
   const passwordMatch = await bcrypt.compare(password,findUser.password);

   if(passwordMatch){
        return { data: generateJWT({
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            email
        }),
         statusCode: 200 
        }; 
    }
    
return { data: { message: "Incorrect email or password!" }, statusCode: 400 }; 
}

const generateJWT = (data: any) => {
    return jwt.sign(data ,'kcQOgjuIRjsHOlrWCxmzwX0yTXoW2bgt');
}
