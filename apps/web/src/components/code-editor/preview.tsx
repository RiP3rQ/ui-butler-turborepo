import { LiveError, LivePreview, LiveProvider } from "react-live";

interface CodePreviewProps {
  code: string;
}

export function CodePreview({ code }: Readonly<CodePreviewProps>): JSX.Element {
  return (
    <div className="w-full rounded-md bg-background ">
      <LiveProvider code={code} noInline={false}>
        <LivePreview className="rounded-lg border border-gray-300 p-4" />
        <LiveError className="rounded-lg border border-gray-300 p-4 text-red-500" />
      </LiveProvider>
    </div>
  );
}
