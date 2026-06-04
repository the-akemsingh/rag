"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

type LoggedInUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
};

type GoogleSignupButtonProps = {
  onLoginSuccess?: (user: LoggedInUser) => void;
};

export default function GoogleSignupButton({
  onLoginSuccess,
}: GoogleSignupButtonProps) {
  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const googleToken = credentialResponse.credential;

      if (!googleToken) {
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/google",
        {
          token: googleToken,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("auth-changed"));
      onLoginSuccess?.(response.data.user);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.log("Google Login Failed");
      }}
    />
  );
}