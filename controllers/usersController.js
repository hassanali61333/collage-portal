import bcrypt from "bcryptjs";
import User from "../models/usersModel.js";
import connectDB from "../lib/db.js";
import { cookies } from "next/headers";

export const signup = async (req) => {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return { success: false, message: "All fields are required", status: 400 };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters",
        status: 400,
      };
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        success: false,
        message: "This email is already registered. Please login instead.",
        status: 409,
      };
    }

    // Password hash karein
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return {
      success: true,
      message: "Signup successful! Please login.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        isFormFill: user.isFormFill,
      },
      status: 201,
    };
  } catch (error) {
    console.error("Signup Error:", error);
    return {
      success: false,
      message: "Server error. Please try again later.",
      status: 500,
    };
  }
};

export const login = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    if (!email || !password) {
      return { success: false, message: "All fields are required", status: 400 };
    }

    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "Invalid email or password", status: 401 };
    }

    let isMatch = false;

    if (user.password.startsWith("$2")) {
      // Naya user: password hashed hai
      isMatch = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      // Purana user: password plain text tha, ab hash karke save kar do
      isMatch = true;
      const hashed = await bcrypt.hash(password, 10);
      await User.updateOne({ _id: user._id }, { password: hashed });
    }

    if (!isMatch) {
      return { success: false, message: "Invalid email or password", status: 401 };
    }

    const cookieStore = await cookies();

    cookieStore.set("role", user.role, {
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return {
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFormFill: user.isFormFill,
      },
      status: 200,
    };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "Server error", status: 500 };
  }
};