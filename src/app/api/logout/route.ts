import { logoutUser } from "@/controllers/user.controller";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    return await logoutUser(req);
}