import { ShieldIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@shared/ui/components/ui/alert";
import { type JSX } from "react";
import { CreateCredentialDialog } from "@/components/credentials/create-credential-dialog";
import { UserCredentials } from "@/components/credentials/user-credentials";
import { getUserCredentials } from "@/actions/credentials/server-actions";
import { PageHeader } from "@/components/page-header";

export default async function CredentialsPage(): Promise<JSX.Element> {
  const credentials = await getUserCredentials();

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Credentials"
        description="Manage your credentials"
        action={<CreateCredentialDialog />}
      />

      <Alert className="border-primary/20 bg-primary/5">
        <ShieldIcon className="size-4 stroke-primary" />
        <AlertTitle className="text-white font-medium">Encryption</AlertTitle>
        <AlertDescription className="text-sm text-gray-400/90">
          All information is securely encrypted, ensuring your data remains safe
        </AlertDescription>
      </Alert>

      <UserCredentials initialData={credentials} />
    </div>
  );
}
