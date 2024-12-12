import { ShieldIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import { Suspense } from "react";
import { CreateCredentialDialog } from "@/components/credentials/create-credential-dialog";
import { UserCredendials } from "@/components/credentials/user-credentials";
import { UserWorkflowsSkeleton } from "@/app/(workflows)/workflows-list/_components/user-workflows-skeleton";
import { getUserCredentials } from "@/actions/credentials/get-user-credentials";

export default async function CredentialsPage() {
  const credentials = await getUserCredentials();

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Credentials</h1>
          <p className="text-muted-foreground">Manage you credentials</p>
        </div>
        <CreateCredentialDialog />
      </div>

      <div className="h-full py-6 space-y-8">
        <Alert>
          <ShieldIcon className="size-4 stroke-primary" />
          <AlertTitle className="text-primary">Encryption</AlertTitle>
          <AlertDescription>
            All information in securely encrypted, ensuring your data remains
            safe
          </AlertDescription>
        </Alert>
        <Suspense fallback={<UserWorkflowsSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <UserCredendials initialData={credentials} />
        </Suspense>
      </div>
    </div>
  );
}
