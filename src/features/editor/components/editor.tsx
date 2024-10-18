"use client";

import AISidebar from "@/features/editor/components/ai-sidebar";
import BorderColorSidebar from "@/features/editor/components/border-color-sidebar";
import BorderSidebar from "@/features/editor/components/border-sidebar";
import ColorSidebar from "@/features/editor/components/color-sidebar";
import DrawSidebar from "@/features/editor/components/draw-sidebar";
import EditImageSidebar from "@/features/editor/components/edit-image-sidebar";
import ElementsSidebar from "@/features/editor/components/elements-sidebar";
import FontSidebar from "@/features/editor/components/font-sidebar";
import Footer from "@/features/editor/components/footer";
import Navbar from "@/features/editor/components/navbar";
import Sidebar from "@/features/editor/components/sidebar";
import TextSidebar from "@/features/editor/components/text-sidebar";
import Toolbar from "@/features/editor/components/toolbar";
import TransparencySidebar from "@/features/editor/components/transparency-sidebar";
import UploadsSidebar from "@/features/editor/components/uploads-sidebar";
import WorkspaceBackgroundColorSidebar from "@/features/editor/components/workspace-color-sidebar";
import { selectionOnlyTools } from "@/features/editor/constants";
import { useEditor } from "@/features/editor/hooks/useEditor";
import { SelectedTool } from "@/features/editor/types";
import { FetchProjectResponseType } from "@/features/projects/api/use-fetch-project";
import { usePatchProject } from "@/features/projects/api/use-patch-project";
import { fabric } from "fabric";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useRef } from "react";

type Props = {
  initialData: FetchProjectResponseType["data"];
};

const Editor = ({ initialData }: Props) => {
  const { mutate } = usePatchProject(initialData.id);

  // There is no error here. vscode does not understand the type of debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((values: { json: string; height: number; width: number }) => {
      mutate(values);
    }, 1000),
    [mutate]
  );

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] =
    React.useState<SelectedTool>("select");
  const onSelectionClear = useCallback(() => {
    if (selectionOnlyTools.includes(selectedTool)) {
      setSelectedTool("select");
    }
  }, [selectedTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    selectionClearedCallback: onSelectionClear,
    saveCallback: debouncedSave,
  });

  // added useCallback because onChangeSelectedTool is a dependency of useEffect
  const onChangeSelectedTool = useCallback(
    (tool: SelectedTool) => {
      if (tool === "draw") {
        // draw mode
        editor?.enableDrawingMode();
      }
      if (selectedTool === "draw") {
        // exit draw mode
        editor?.disableDrawingMode();
      }
      if (tool === selectedTool) {
        return setSelectedTool("select");
      }
      setSelectedTool(tool);
    },
    [selectedTool, editor]
  );

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      // This will make sure that the controls of the objects are above the overlay
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvasWrapper: canvasWrapperRef.current!,
      initialCanvas: canvas,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <Navbar
        id={initialData.id}
        selectedTool={selectedTool}
        onChangeSelectedTool={onChangeSelectedTool}
        editor={editor}
      />
      <div className="flex absolute h-[calc(100%-56px)] w-full top-14">
        <Sidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
        />
        <ElementsSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <ColorSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <BorderColorSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <BorderSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <TransparencySidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <TextSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <FontSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <UploadsSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <EditImageSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <AISidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <DrawSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <WorkspaceBackgroundColorSidebar
          selectedTool={selectedTool}
          onChangeSelectedTool={onChangeSelectedTool}
          editor={editor}
        />
        <main className="flex relative overflow-auto bg-zinc-900 flex-1 flex-col">
          <Toolbar
            editor={editor}
            selectedTool={selectedTool}
            onChangeSelectedTool={onChangeSelectedTool}
            // Hack to re-render toolbar when active object changes
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div
            className="h-[calc(100%-96px)] flex-1 bg-zinc-900"
            ref={canvasWrapperRef}
          >
            {/* Canvas resizing is difficult hence we are using a div as canvasWrapperRef and we will use a resize observer to see if canvasWrapperRef is resized and use the width and height from there to set width and height of canvas */}
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  );
};

export default Editor;
