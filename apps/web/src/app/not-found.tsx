import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { type JSX } from "react";

function NotFoundPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Don&#39;t worry, even the best data sometimes get lost in the
          internet.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
            href="/analytics-dashboard"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          If you believe this is a mistake, please contact our support team.
        </p>
      </div>
    </div>
  );
}
export default NotFoundPage;
