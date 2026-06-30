import React from 'react';
import { AuthUI } from '../components/ui/auth-fuse';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AuthUI 
        signInContent={{
          image: {
            src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80",
            alt: "Sign in to your account"
          },
          quote: {
            text: "Welcome back! Sign in to continue your journey.",
            author: "Sign Language App"
          }
        }}
        signUpContent={{
          image: {
            src: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
            alt: "Create a new account"
          },
          quote: {
            text: "Join our community today and start your journey.",
            author: "Sign Language App"
          }
        }}
      />
    </div>
  );
};

export default LoginPage;
