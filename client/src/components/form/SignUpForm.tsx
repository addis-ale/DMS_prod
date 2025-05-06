"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "./googleSignin";

const FormSchema = z
  .object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must have than 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });

const SignUpForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://dms-prod-3w6u.onrender.com/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.username,
            email: values.email,
            password: values.password,
          }),
        }
      );

      if (response.ok) {
        router.push("/sign-in");
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred during sign up");
      }
    } catch (error) {
      console.log(error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isProcessing = form.formState.isSubmitting || isLoading;

  return (
    <div className="">
      <Card className="w-full max-w-lg border-blue-600/20 bg-white shadow-lg px-8">
        <CardHeader className="space-y-1 text-center pb-2 pt-4">
          <CardTitle className="text-2xl font-bold text-gray-900 flex gap-2 items-center">
            <Link href={"/"}>
              <ArrowLeft />
            </Link>
            <span>Create Account</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-800">Username</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormControl>
                        <Input
                          placeholder="johndoe"
                          className={cn(
                            "border-gray-300 pl-10 focus-visible:border-blue-600 focus-visible:ring-blue-600",
                            form.formState.errors.username
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          )}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-sm font-medium text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-800">Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className={cn(
                            "border-gray-300 pl-10 focus-visible:border-blue-600 focus-visible:ring-blue-600",
                            form.formState.errors.email
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          )}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-sm font-medium text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-800">Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "border-gray-300 pl-10 focus-visible:border-blue-600 focus-visible:ring-blue-600",
                            form.formState.errors.password
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          )}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-sm font-medium text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-gray-800">
                      Confirm Password
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "border-gray-300 pl-10 focus-visible:border-blue-600 focus-visible:ring-blue-600",
                            form.formState.errors.confirmPassword
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          )}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-sm font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 border-t border-gray-200 p-4 pt-3">
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
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
};

export default SignUpForm;
