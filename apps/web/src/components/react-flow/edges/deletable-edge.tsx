import type { EdgeProps } from "@xyflow/react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { Button } from "@repo/ui/components/ui/button";
import { XIcon } from "lucide-react";

function DeletableEdge(props: Readonly<EdgeProps>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath(props);
  const { setEdges } = useReactFlow();

  return (
    <>
      <BaseEdge
        markerEnd={props.markerEnd}
        path={edgePath}
        style={props.style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX.toString()}px,${labelY.toString()}px)`,
            pointerEvents: "all",
          }}
        >
          <Button
            className="size-5 border cursor-pointer rounded-full text-xs leading-none hover:shadow-lg"
            onClick={() => {
              setEdges((edges) => edges.filter((edge) => edge.id !== props.id));
            }}
            size="icon"
            variant="outline"
          >
            <XIcon />
          </Button>
        </div>
        {/*  TODO: ARROW AT THE END OF THE EDGE*/}
      </EdgeLabelRenderer>
    </>
  );
}
export default DeletableEdge;
