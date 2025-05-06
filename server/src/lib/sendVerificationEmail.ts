import { Response } from "express";

import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { prismaClient } from "../prisma";
import { User } from "@prisma/client";

//node mailer stuff
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
//test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("ready for message");
  }
});
export const sendVerificationEmail = async (
  { id, email }: { id: string; email: string },
  res: Response
) => {
  //url
  const currentUrl = "https://dms-prod-3w6u.onrender.com/";
  const uniqueString = uuidv4() + id;
  const verificationLink = `${currentUrl}api/verify/${id}/${uniqueString}`;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email - eFile",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify your email - eFile</title>
        <style>
          body {
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f7;
            color: #51545e;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #333333;
            margin: 0;
          }
          .content {
            font-size: 16px;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            margin: 30px 0;
            padding: 14px 28px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .footer {
            font-size: 13px;
            text-align: center;
            color: #999999;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to eFile</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thanks for signing up for <strong>eFile</strong> — your smart document management system.</p>
            <p>Please verify your email address by clicking the button below:</p>
      
            <p style="text-align: center;">
              <a href="${verificationLink}" class="btn">Verify Email</a>
            </p>
      
            <p>If you did not create an account with eFile, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; 2025 eFile. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await prismaClient.userVerification.deleteMany({
    where: {
      userId: id,
    },
  });
  await prismaClient.userVerification.create({
    data: {
      userId: id,
      uniqueString,
      expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
    },
  });
  await transporter.sendMail(mailOptions);
  res
    .status(200)
    .json({ success: "pending", message: "Email verification sent" });
};
export const sendResetPasswordEmail = async (
  user: User,
  redirectUrl: string,
  res: Response
) => {
  const { id, email } = user;
  const resetString = uuidv4() + id;
  const resetLink = `${redirectUrl}?userId=${id}&resetString=${resetString}`;
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Reset Your Password - eFile",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Reset your password - eFile</title>
        <style>
          body {
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f7;
            color: #51545e;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #333333;
            margin: 0;
          }
          .content {
            font-size: 16px;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            margin: 30px 0;
            padding: 14px 28px;
            background-color: #ef4444;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .footer {
            font-size: 13px;
            text-align: center;
            color: #999999;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your <strong>eFile</strong> account.</p>
            <p>Click the button below to reset your password:</p>
      
            <p style="text-align: center;">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </p>
      
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
          </div>
          <div class="footer">
            &copy; 2025 eFile. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  //delete all password reset created before
  await prismaClient.resetPassword.deleteMany({
    where: {
      userId: id,
    },
  });
  await prismaClient.resetPassword.create({
    data: {
      userId: id,
      resetString,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  await transporter.sendMail(mailOptions);
  res.status(200).json({ success: "pending", message: "Password reset sent" });
};
