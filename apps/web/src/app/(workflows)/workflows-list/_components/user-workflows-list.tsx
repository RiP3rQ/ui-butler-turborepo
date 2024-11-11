export async function UserWorkflows() {
  const worksflows = await getUserWorkflows();

  if (!worksflows) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Failed to fetch workflows</AlertTitle>
        <AlertDescription>
          Something went wrong while fetching your workflows. Please try again
          later.
        </AlertDescription>
      </Alert>
    );
  }

  if (worksflows.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <div className="rounded-full bg-accent size-20 flex items-center justify-center">
          <InboxIcon className="stroke-primary" size={40} />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <p className="font-bold">No workflows found</p>
          <p className="text-sm text-muted-foreground">
            Click the button below to create a new workflow
          </p>
        </div>
        <CreateWorkflowDialog triggerText="Created your first workflow" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {worksflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}
