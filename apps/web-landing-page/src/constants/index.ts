import { Icons } from "@shared/ui/components/landing-page/icons";

export const perks = [
  {
    Icon: Icons.Auth,
    title: "Get Started",
    info: "Create your free account to start organizing your UI components with UI-Butler.",
  },
  {
    Icon: Icons.Customize,
    title: "Organize",
    info: "Categorize and manage your components for easy access and reuse.",
  },
  {
    Icon: Icons.Launch,
    title: "Build",
    info: "Leverage your organized components to build projects faster and more efficiently.",
  },
] as const;

export const features = [
  {
    Icon: Icons.Bolt,
    title: "Quick Setup",
    info: "Set up your component library in minutes with our intuitive interface.",
  },
  {
    Icon: Icons.Palette,
    title: "Component Customization",
    info: "Easily customize components to fit your project's needs.",
  },
  {
    Icon: Icons.Seo,
    title: "Component Documentation",
    info: "Automatically generate documentation for your components.",
  },
  {
    Icon: Icons.Monitor,
    title: "Responsive Design",
    info: "Ensure your components look great on all devices.",
  },
  {
    Icon: Icons.Shop,
    title: "Component Testing",
    info: "Test your components in various environments directly within UI-Butler.",
  },
  {
    Icon: Icons.Server,
    title: "Secure Storage",
    info: "Keep your components safe with secure and reliable cloud storage.",
  },
] as const;

export const pricingCards = [
  {
    title: "Starter",
    description: "Perfect for individual developers",
    price: "Free",
    duration: "",
    highlight: "Key features",
    buttonText: "Start for free",
    features: ["Limited components", "1 Team member", "Basic customization"],
    priceId: "",
  },
  {
    title: "Pro",
    description: "Ideal for small teams and projects",
    price: "$29",
    duration: "month",
    highlight: "Key features",
    buttonText: "Upgrade to Pro",
    features: [
      "Unlimited components",
      "5 Team members",
      "Advanced customization",
      "Component documentation",
    ],
    priceId: "price_1OYxkqFj9oKEERu1KfJGWxgN",
  },
  {
    title: "Enterprise",
    description: "For large teams and organizations",
    price: "$99",
    duration: "month",
    highlight: "Everything in Pro, plus",
    buttonText: "Upgrade to Enterprise",
    features: [
      "Unlimited components",
      "Unlimited Team members",
      "Custom branding",
      "Priority support (24/7)",
    ],
    priceId: "price_1OYxkqFj9oKEERu1NbKUxXxN",
  },
];

export const bentoCards = [
  {
    title: "Start with Organization",
    info: "Easily categorize and organize your components for quick access.",
    imgSrc: "/assets/bento-1.svg", // Organization icon
    alt: "Organize your UI components",
  },
  {
    title: "AI Assistance",
    info: "Our intelligent AI helps you manage and suggest components based on your needs.",
    imgSrc: "/assets/bento1.svg", // AI Assistant icon
    alt: "AI component management assistant",
  },
  {
    title: "Drag & Drop Interface",
    info: "Effortlessly organize and customize your components with our drag-and-drop editor.",
    imgSrc: "/assets/bento1.svg", // Drag and Drop icon
    alt: "Component customization with drag and drop",
  },
  {
    title: "Build & Deploy",
    info: "Seamlessly integrate your components and deploy your projects faster.",
    imgSrc: "/assets/bento1.svg", // Rocket launching or project deployment icon
    alt: "Deploy your projects",
  },
] as const;

export const reviews = [
  {
    name: "Alice",
    username: "@alice",
    body: "UI-Butler has revolutionized the way I organize and use my components. It's a game-changer.",
  },
  {
    name: "Bob",
    username: "@bob",
    body: "The AI assistance is incredibly helpful. It’s like having a smart assistant for my UI components.",
  },
  {
    name: "Charlie",
    username: "@charlie",
    body: "The drag-and-drop interface makes customization a breeze. Highly recommend UI-Butler.",
  },
  {
    name: "Diana",
    username: "@diana",
    body: "The documentation feature is a lifesaver. All my components are well-documented automatically.",
  },
  {
    name: "Eve",
    username: "@eve",
    body: "UI-Butler has saved me so much time. I can now focus more on building rather than organizing.",
  },
  {
    name: "Frank",
    username: "@frank",
    body: "The secure storage gives me peace of mind knowing my components are safe and always accessible.",
  },
] as const;
