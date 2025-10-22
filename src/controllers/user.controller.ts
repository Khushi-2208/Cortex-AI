import connectDB from "@/DB/config";
import { User, UserDocument } from "@/models/user.model";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";

/**
 * Generate and save refresh token for a user
 */
const generateRefreshTokens = async (userId: string): Promise<string> => {
    try {
        const user = await User.findById(userId) as UserDocument;
        
        if (!user) {
            throw new Error("User not found");
        }

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return refreshToken;
    } catch (error: any) {
        console.error("Token generation error:", error);
        throw new Error("Failed to generate refresh token");
    }
};

const signupUser = async (req: Request): Promise<NextResponse> => {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !name || !password) {
            return NextResponse.json(
                { msg: "All fields are required", success: false }, 
                { status: 400 }
            );
        }

        await connectDB();

        const isUserAlreadyPresent = await User.findOne({ email }) as UserDocument;

        if (isUserAlreadyPresent) {
            return NextResponse.json(
                { msg: "User already exists", success: false }, 
                { status: 409 }
            );
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
            return NextResponse.json(
                { msg: "User registration failed", success: false }, 
                { status: 500 }
            );
        }

        const refreshToken = await generateRefreshTokens(user._id as string);

        const response = NextResponse.json(
            { 
                msg: "User successfully registered", 
                success: true,
                user: createdUser 
            }, 
            { status: 201 }
        );

        // ⭐ Add explicit path
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/' // ⭐ IMPORTANT: Add this
        });

        return response;
    } catch (err: any) {
        console.error("Signup error:", err);
        return NextResponse.json(
            { msg: "Registration failed", error: err.message, success: false }, 
            { status: 500 }
        );
    }
};

const loginUser = async (req: Request): Promise<NextResponse> => {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { msg: "Email and password are required", success: false }, 
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email }) as UserDocument;

        if (!user) {
            return NextResponse.json(
                { msg: "Invalid credentials", success: false }, 
                { status: 401 }
            );
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { msg: "Invalid credentials", success: false }, 
                { status: 401 }
            );
        }

        const refreshToken = await generateRefreshTokens(user._id as string);

        const response = NextResponse.json(
            { 
                msg: "User successfully logged in", 
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
            }, 
            { status: 200 }
        );

        console.log("Setting refreshToken:", refreshToken);
        
        // ⭐ Add explicit path
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/' // ⭐ IMPORTANT: Add this
        });

        return response;
    } catch (err: any) {
        console.error("Login error:", err);
        return NextResponse.json(
            { msg: "Login failed", error: err.message, success: false }, 
            { status: 500 }
        );
    }
};

const logoutUser = async (req: NextRequest): Promise<NextResponse> => {
    try {
        const token = req.cookies.get("refreshToken")?.value;

        if (!token) {
            return NextResponse.json(
                { msg: "No token provided", success: false }, 
                { status: 401 }
            );
        }

        await connectDB();

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
        } catch (error) {
            return NextResponse.json(
                { msg: "Invalid or expired token", success: false }, 
                { status: 401 }
            );
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            return NextResponse.json(
                { msg: "User not found", success: false }, 
                { status: 404 }
            );
        }

        await User.findByIdAndUpdate(
            decoded._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        );

        const response = NextResponse.json(
            { msg: "User successfully logged out", success: true }, 
            { status: 200 }
        );

        // ⭐ Proper cookie deletion with path
        response.cookies.set("refreshToken", "", {
            expires: new Date(0),
            path: '/',
            httpOnly: true,
        });

        return response;
    } catch (err: any) {
        console.error("Logout error:", err);
        return NextResponse.json(
            { msg: "Logout failed", error: err.message, success: false }, 
            { status: 500 }
        );
    }
};




export {
    generateRefreshTokens,
    loginUser,
    logoutUser,
    signupUser
};