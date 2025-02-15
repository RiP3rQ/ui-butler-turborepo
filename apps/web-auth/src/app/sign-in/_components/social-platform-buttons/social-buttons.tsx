import { type JSX } from "react";
import { GithubIcon, GlobeIcon } from "lucide-react";
import SocialPlatformButton from "@/app/sign-in/_components/social-platform-buttons/social-platform-button";
import { getApiUrl } from "@/lib/utils";

const getSocialAuthUrl = (provider: "google" | "github"): string => {
  const apiUrl = getApiUrl();

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

export function SocialLoginButtons({
  isDisabled,
}: SocialLoginButtonsProps): JSX.Element {
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
