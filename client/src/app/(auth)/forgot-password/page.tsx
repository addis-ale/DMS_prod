"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FormData = {
  email: string;
};

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(false); // reset previous success state
    try {
      const response = await fetch(
        "https://dms-prod-3w6u.onrender.com/api/resetpasswordrequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            redirectUrl: "https://dms-prod-7z4r.vercel.app/reset-password/",
          }),
          credentials: "include",
        }
      );

      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset link");
      }

      setSuccess(true); // show success message
    } catch (err: any) {
      console.log("Forgot password error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const isProcessing = isSubmitting;

  return (
    <div className="">
      <Card className="w-full max-w-md border-blue-600/20 bg-white shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex gap-2 items-center">
            <Link href={"/sign-in"}>
              <ArrowLeft />
            </Link>
            <span>Forgot Password</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Display error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Display success message */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-400 bg-green-100 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>
                Password reset link sent! Please check your email inbox.
              </span>
            </div>
          )}

          {!success ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={cn(
                      "border-gray-300 pl-10 focus-visible:border-blue-600 focus-visible:ring-blue-600",
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    )}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <Button
              className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              onClick={() => setSuccess(false)}
            >
              Send Another Link
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 border-t border-gray-200 p-6 pt-4">
          <div className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ForgotPassword;
