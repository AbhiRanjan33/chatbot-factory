import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Create an Account</h1>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/" // Redirect to home after sign-up
          forceRedirectUrl="/" // Force redirect to home
          appearance={{
            elements: {
              socialButtonsBlockButton: 'hidden', // Hide OAuth buttons
            },
          }}
        />
      </div>
    </div>
  );
}