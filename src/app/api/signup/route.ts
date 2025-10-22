import { signupUser } from "@/controllers/user.controller";


export async function POST(req:Request) {
    return await signupUser(req);
}

