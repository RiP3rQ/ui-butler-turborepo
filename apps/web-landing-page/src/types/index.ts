import { type JSX } from "react";
import { type LucideProps } from "lucide-react";

export interface Perk {
  Icon: (props: LucideProps) => JSX.Element;
  title: string;
  info: string;
}

export interface Feature {
  Icon: (props: LucideProps) => JSX.Element;
  title: string;
  info: string;
}

export interface PricingCard {
  title: string;
  description: string;
  price: string;
  duration: string;
  highlight: string;
  buttonText: string;
  features: string[];
  priceId: string;
}

export interface Review {
  name: string;
  username: string;
  body: string;
}
