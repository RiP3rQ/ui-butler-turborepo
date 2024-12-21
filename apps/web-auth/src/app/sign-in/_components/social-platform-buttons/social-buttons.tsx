import SocialPlatformButton from "@/app/sign-in/_components/social-platform-buttons/social-platform-button";
import { GithubIcon, GlobeIcon } from "lucide-react";

const getSocialAuthUrl = (provider: "google" | "github"): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl || apiUrl.trim() === "") {
    console.error(
      "API URL is not defined. Please check your environment variables.",
    );
    return `/auth/${provider}`;
  }

  return `${apiUrl}/auth/${provider}`;
};

interface SocialLoginButtonsProps {
  isDisabled: boolean;
}

export function SocialLoginButtons({ isDisabled }: SocialLoginButtonsProps) {
  const handleSocialLogin = (provider: "google" | "github") => () => {
    window.location.href = getSocialAuthUrl(provider);
  };

  return (
    <>
      <SocialPlatformButton
        title="Google"
        icon={GlobeIcon}
        isLoading={isDisabled}
        onClick={handleSocialLogin("google")}
      />
      <SocialPlatformButton
        title="Github"
        icon={GithubIcon}
        isLoading={isDisabled}
        onClick={handleSocialLogin("github")}
      />
    </>
  );
}
