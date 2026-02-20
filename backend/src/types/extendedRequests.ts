// src/types/extendedRequest.ts
import type { Request } from "express";
import type { IUser } from "../models/userModel.js";

export interface ExtendedRequest extends Request {
  user?: IUser | any;
}
