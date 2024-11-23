// "use client";
//
// import { useQuery } from "@tanstack/react-query";
// import { getAvailableCredits } from "@/actions/billing/getAvailableCredits";
// import Link from "next/link";
// import { CoinsIcon, Loader2Icon } from "lucide-react";
// import { cn } from "@/lib/utils";
// import CountUpWrapper from "@/components/available-credits/count-up-wrapper";
// import { buttonVariants } from "@/components/ui/button";
//
// const UserAvailableCreditsBadge = () => {
//   const query = useQuery({
//     queryKey: ["user-available-credits"],
//     queryFn: () => getAvailableCredits(),
//     refetchInterval: 1000 * 60, // 5 minutes
//   });
//
//   return (
//     <Link
//       href={"/billing"}
//       className={cn(
//         "flex w-full space-x-2 items-center justify-center",
//         buttonVariants({ variant: "outline" }),
//       )}
//     >
//       <CoinsIcon size={20} className={"stroke-primary"} />
//       <span className={"font-semibold capitalize"}>
//         {query.isLoading && (
//           <Loader2Icon className={"size-4 animate-spin stroke-primary"} />
//         )}
//         {!query.isLoading && query?.data && (
//           <CountUpWrapper value={query.data} />
//         )}
//         {!query.isLoading && query.data === undefined && "-"}
//       </span>
//     </Link>
//   );
// };
// export default UserAvailableCreditsBadge;
