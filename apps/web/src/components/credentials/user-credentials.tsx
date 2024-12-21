"use client";
import { ShieldOffIcon } from "lucide-react";
import { Card } from "@repo/ui/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { type UserCredentials } from "@repo/types";
import { type JSX } from "react";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CreateCredentialDialog } from "@/components/credentials/create-credential-dialog";
import { getUserCredentials } from "@/actions/credentials/server-actions";

interface UserCredentialsProps {
  initialData: UserCredentials[];
}

export function UserCredendials({
  initialData,
}: Readonly<UserCredentialsProps>): JSX.Element {
  const { data } = useQuery({
    queryKey: ["user-credentials"],
    queryFn: getUserCredentials,
    initialData,
  });

  if (data.length === 0) {
    return (
      <Card>
        <div className="w-full p-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="rounded-full bg-accent size-20 flex items-center justify-center">
              <ShieldOffIcon size={40} className="stroke-primary" />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <p className="text-bold">No credentials found yet</p>
              <p className="text-sm text-muted-foreground">
                Click the button below to add your first credential
              </p>
              <CreateCredentialDialog triggerText="Create your first credential" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {data.map((credential) => (
        <CredentialCard key={credential.id} credential={credential} />
      ))}
    </div>
  );
}
