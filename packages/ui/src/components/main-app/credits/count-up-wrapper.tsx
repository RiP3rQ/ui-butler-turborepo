import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface CountUpWrapperProps {
  value: number;
}
function CountUpWrapper({ value }: Readonly<CountUpWrapperProps>) {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-20 h-6" />;
  }

  return <CountUp decimals={0} duration={0.5} end={value} preserveValue />;
}
export default CountUpWrapper;
