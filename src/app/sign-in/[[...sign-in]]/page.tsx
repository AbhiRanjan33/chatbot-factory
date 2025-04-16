"use client";

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Welcome Back</h1>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/" // Redirect to home after sign-in
          forceRedirectUrl="/" // Force redirect to home
          appearance={{
            elements: {
              socialButtonsBlockButton: 'hidden', // Hide OAuth buttons to match SignUp
            },
          }}
        />
      </div>
    </div>
  );
}