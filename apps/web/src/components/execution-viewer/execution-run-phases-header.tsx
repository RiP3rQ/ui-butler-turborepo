import React from 'react';
import { WorkflowIcon } from 'lucide-react';

const ExecutionRunPhasesHeader = () => {
  return (
    <div className={'flex items-center justify-center py-2 px-4'}>
      <div className={'text-muted-foreground flex items-center gap-2'}>
        <WorkflowIcon size={20} className={'stroke-muted-foreground/80'} />
        <span className={'font-semibold'}>Phases</span>
      </div>
    </div>
  );
};
export default ExecutionRunPhasesHeader;
