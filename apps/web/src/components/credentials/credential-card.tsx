import { LockKeyholeIcon, EyeIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { type UserCredentials } from "@repo/types";
import { type JSX } from "react";
import { DeleteCredentialDialog } from "./delete-credential-dialog";
import { RevealCredentialDialog } from "./reveal-credential-dialog";
import { protoTimestampToDate } from "@/lib/dates";

interface CredentialCardProps {
  credential: UserCredentials;
}

/**
 * Displays a credential card with options to reveal or delete the credential
 * @param credential - The user credential to display
 */
export function CredentialCard({
  credential,
}: Readonly<CredentialCardProps>): JSX.Element {
  return (
    <Card className="w-full p-4 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex gap-3 items-center">
        <div className="rounded-full bg-primary/10 size-9 flex items-center justify-center">
          <LockKeyholeIcon size={18} className="stroke-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{credential.name}</p>
          <p className="text-xs text-muted-foreground">
            Created{" "}
            {formatDistanceToNow(protoTimestampToDate(credential.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RevealCredentialDialog credentialId={credential.id}>
          <Button variant="ghost" size="sm" className="gap-2">
            <EyeIcon size={16} />
            Reveal
          </Button>
        </RevealCredentialDialog>
        <DeleteCredentialDialog
          name={credential.name}
          credentialId={credential.id}
        />
      </div>
    </Card>
  );
}
