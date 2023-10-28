import * as dotenv from "dotenv";
import InputSocket from "./Models/InputSocket";

dotenv.config();

let server = new InputSocket(6666);