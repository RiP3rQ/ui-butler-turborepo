import { LockKeyholeIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@repo/ui/components/ui/card";
import { type UserCredentials } from "@repo/types";
import { type JSX } from "react";
import { DeleteCredentialDialog } from "@/components/credentials/delete-credential-dialog";

interface CredentialCardProps {
  credential: UserCredentials;
}

export function CredentialCard({
  credential,
}: Readonly<CredentialCardProps>): JSX.Element {
  return (
    <Card className="w-full p-4 flex justify-between">
      <div className="flex gap-2 items-center">
        <div className="rounded-full bg-primary/10 size-8 flex items-center justify-center">
          <LockKeyholeIcon size={18} className="stroke-primary" />
        </div>
        <div>
          <p className="font-bold">{credential.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(credential.createdAt, {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <DeleteCredentialDialog
        name={credential.name}
        credentialId={credential.id}
      />
    </Card>
  );
}
