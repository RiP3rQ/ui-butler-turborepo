import { ShieldIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import { type JSX } from "react";
import { CreateCredentialDialog } from "@/components/credentials/create-credential-dialog";
import { UserCredentials } from "@/components/credentials/user-credentials";
import { getUserCredentials } from "@/actions/credentials/server-actions";

export default async function CredentialsPage(): Promise<JSX.Element> {
  const credentials = await getUserCredentials();

  return (
    <div className="flex flex-1 flex-col h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Credentials
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your credentials
          </p>
        </div>
        <CreateCredentialDialog />
      </div>

      <div className="flex flex-col space-y-6">
        <Alert className="border-primary/20 bg-primary/5">
          <ShieldIcon className="size-4 stroke-primary" />
          <AlertTitle className="text-white font-medium">Encryption</AlertTitle>
          <AlertDescription className="text-sm text-gray-400/90">
            All information is securely encrypted, ensuring your data remains
            safe
          </AlertDescription>
        </Alert>
        <UserCredentials initialData={credentials} />
      </div>
    </div>
  );
}
