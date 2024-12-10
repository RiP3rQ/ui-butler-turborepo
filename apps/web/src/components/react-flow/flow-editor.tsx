"use client";

import type { Connection, Edge } from "@xyflow/react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  getOutgoers,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import type { AppNode, WorkflowType } from "@repo/types";
import { TaskType } from "@repo/types";
import { useCallback, useEffect } from "react";
import { ClientTaskRegister, createFlowNodeFunction } from "@repo/tasks-client";
import NodeComponent from "@/components/react-flow/nodes/node-component";
import DeletableEdge from "@/components/react-flow/edges/deletable-edge";

interface FlowEditorProps {
  workflow: WorkflowType;
}

const nodeTypes = {
  FlowScrapeNode: NodeComponent,
};

const edgeType = {
  default: DeletableEdge,
};

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = {
  padding: 1,
};

function FlowEditor({ workflow }: Readonly<FlowEditorProps>): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([
    createFlowNodeFunction(TaskType.SET_CODE_CONTEXT),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition);
      if (!flow) return;
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      if (!flow.viewport) return;
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({ x, y, zoom }).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const node = createFlowNodeFunction(type as TaskType, position);
      setNodes((prevNodes) => prevNodes.concat(node));
    },
    [setNodes, screenToFlowPosition],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // @ts-expect-error  // TODO: FIX THIS TYPE
      setEdges((edg) => addEdge({ ...connection, animated: true }, edg));
      if (!connection.targetHandle) return;
      // Remove input value if is present on connection
      const node = nodes.find((n) => n.id === connection.target);
      if (!node) return;
      const nodeInputs = node.data.inputs;
      delete nodeInputs[connection.targetHandle];
      updateNodeData(node.id, { inputs: nodeInputs });
    },
    [nodes, setEdges, updateNodeData],
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // no self-connections allowed
      if (connection.source === connection.target) {
        console.error("Self-connections are not allowed");
        // TODO: TOAST error
        return false;
      }

      // same taskParams can't be connected
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) {
        console.error("Source or target node not found");
        // TODO: TOAST error
        return false;
      }

      // actual nodes connections validation
      const sourceTask = ClientTaskRegister[sourceNode.data.type];
      const targetTask = ClientTaskRegister[targetNode.data.type];

      const output = sourceTask.outputs.find(
        (output) => output.name === connection.sourceHandle,
      );
      const input = targetTask.inputs.find(
        (input) => input.name === connection.targetHandle,
      );

      if (input?.type !== output?.type) {
        console.error("Connection type mismatch");
        // TODO: TOAST error
        return false;
      }

      // TODO: EXPORT AS FUNCTION
      const hasCycle = (node: AppNode, visited = new Set()) => {
        if (visited.has(node.id)) return true;
        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      const detectedCycle = hasCycle(targetNode);

      return !detectedCycle;
    },
    [nodes, edges],
  );

  return (
    <main className="h-full w-full">
      <ReactFlow
        edges={edges}
        fitViewOptions={fitViewOptions}
        isValidConnection={isValidConnection}
        nodes={nodes}
        onDragOver={onDragOver}
        snapGrid={snapGrid}
        // center view on nodes with additional padding
        // fitView --> center view on first node
        onNodesChange={onNodesChange}
        edgeTypes={edgeType}
        // makes flow less fluid by snapping to grid
        snapToGrid
        onDrop={onDrop}
        // connect nodes with edges
        onConnect={onConnect}
        // validate connections
        onEdgesChange={onEdgesChange}
        // custom node and edge types for rendering
        nodeTypes={nodeTypes}
      >
        <Controls fitViewOptions={fitViewOptions} position="top-left" />
        <Background gap={12} size={1} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </main>
  );
}
export default FlowEditor;
