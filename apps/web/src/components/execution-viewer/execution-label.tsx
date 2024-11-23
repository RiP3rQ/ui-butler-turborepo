import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

type ExecutionLabelProps = {
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
};
const ExecutionLabel = ({
                          icon: Icon,
                          label,
                          value,
                        }: Readonly<ExecutionLabelProps>) => {
  return (
    <div className={'flex justify-between items-center py-2 px-4 text-sm'}>
      <div className={'text-muted-foreground flex items-center gap-2'}>
        <Icon size={20} className={'stroke-muted-foreground'} />
        <span>{label}</span>
      </div>
      <div className={'font-semibold capitalize flex gap-2 items-center'}>
        {value}
      </div>
    </div>
  );
};
export default ExecutionLabel;
