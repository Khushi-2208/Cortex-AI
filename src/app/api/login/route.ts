import { loginUser } from "@/controllers/user.controller";

export async function POST(req:Request) {
    return await loginUser(req);
}