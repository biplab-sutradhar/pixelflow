import {
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  FILL_COLOR,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  PENTAGON_OPTIONS,
  RECTANGLE_OPTIONS,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
  TEXT_OPTIONS,
  TRIANGLE_OPTIONS,
} from "@/features/editor/constants";
import { useCanvasEvents } from "@/features/editor/hooks/useCanvasEvents";
import { useClipboard } from "@/features/editor/hooks/useClipboard";
import { CreateEditorProps, Editor } from "@/features/editor/types";
import { generateFilter, isTextType } from "@/features/editor/utils";
import { fabric } from "fabric";
import { ITextOptions } from "fabric/fabric-impl";
import { useCallback, useMemo, useState } from "react";
import { useAutoResize } from "./useAutoResize";

const createEditor = ({
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  strokeColor,
  strokeWidth,
  setFillColor,
  setStrokeColor,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  copy,
  paste,
}: CreateEditorProps): Editor => {
  const getWorkSpace = () => {
    return canvas
      .getObjects()
      .find((object) => object.name === "defaultCanvasWorkspace");
  };

  const centerObject = (object: fabric.Object) => {
    const workspace = getWorkSpace();
    const workspaceCenter = workspace?.getCenterPoint();
    if (!workspaceCenter) return;
    // Use _centerObject to center the object properly in the workspace. Note that centerObject does not work as expected if sidebar is open as the center point has changed after opening the sidebar. centerObject does not accept a second argument so we use _centerObject instead
    // canvas?.centerObject(rectangleObject);
    // @ts-expect-error: _centerObject is not in the TypeScript definitions
    canvas._centerObject(object, workspaceCenter);
  };

  const addObjectToCanvas = (object: fabric.Object) => {
    // Tip: Center the object before adding it to the canvas to make sure the center alignment is not recorded in the canvas history
    centerObject(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  return {
    copy: () => copy(),
    paste: () => paste(),
    addImageFilter: (filter: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = generateFilter(filter);

          // Assign multiple filters to the image
          // imageObject.filters?.push(effect);

          // Assign individual filters to the image
          imageObject.filters = effect ? [effect] : [];
          // Apply the filters to the image
          imageObject.applyFilters();
        }
      });
      canvas.renderAll();
    },
    addPhoto: (url: string) => {
      fabric.Image.fromURL(
        url,
        (image) => {
          const workspace = getWorkSpace();

          // Set the width of the image to the width of the workspace
          image.scaleToWidth(workspace?.width ?? 0);
          image.scaleToHeight(workspace?.height ?? 0);

          addObjectToCanvas(image);
        },
        // Options to allow cross-origin images on fabric canvas
        {
          crossOrigin: "Anonymous",
        }
      );
    },
    addRectangle: () => {
      const rectangleObject = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 30,
        ry: 30,
        // override the default fill, stroke and strokeWidth with the current values to preserve the current values
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        strokeDashArray,
      });
      addObjectToCanvas(rectangleObject);
    },
    addCircle: () => {
      const circleObject = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        // override the default fill, stroke and strokeWidth with the current values
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        strokeDashArray,
      });
      addObjectToCanvas(circleObject);
    },
    addText: (text, options) => {
      const textObject = new fabric.Textbox(text, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });
      addObjectToCanvas(textObject);
    },
    addTriangle: () => {
      const triangleObject = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        // override the default fill, stroke and strokeWidth with the current values
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        strokeDashArray,
      });
      addObjectToCanvas(triangleObject);
    },
    addInverseTriangle: () => {
      // This will show the rotation control at the bottom of the triangle hence we will use a polygon instead of a triangle with angle: 180
      // const triangleObject = new fabric.Triangle({
      //   ...TRIANGLE_OPTIONS,
      //    angle: 180,
      // });
      const WIDTH = TRIANGLE_OPTIONS.width;
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const triangleObject = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          // override the default fill, stroke and strokeWidth with the current values
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          strokeDashArray,
        }
      );
      addObjectToCanvas(triangleObject);
    },
    addDiamond: () => {
      const WIDTH = DIAMOND_OPTIONS.width;
      const HEIGHT = DIAMOND_OPTIONS.height;
      const diamondObject = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          // override the default fill, stroke and strokeWidth with the current values
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          strokeDashArray,
        }
      );
      addObjectToCanvas(diamondObject);
    },
    addPentagon: () => {
      // Pentagon is a 5 sided polygon
      const WIDTH = PENTAGON_OPTIONS.width;
      const HEIGHT = PENTAGON_OPTIONS.height;
      const pentagonObject = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 3 },
          { x: (WIDTH * 2) / 3, y: HEIGHT },
          { x: WIDTH / 3, y: HEIGHT },
          { x: 0, y: HEIGHT / 3 },
        ],
        {
          ...PENTAGON_OPTIONS,
          // override the default fill, stroke and strokeWidth with the current values
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          strokeDashArray,
        }
      );
      addObjectToCanvas(pentagonObject);
    },
    addHexagon: () => {
      // Hexagon is a 6 sided polygon
      const WIDTH = PENTAGON_OPTIONS.width;
      const HEIGHT = PENTAGON_OPTIONS.height;
      const hexagonObject = new fabric.Polygon(
        [
          { x: WIDTH / 4, y: 0 },
          { x: (WIDTH * 3) / 4, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: (WIDTH * 3) / 4, y: HEIGHT },
          { x: WIDTH / 4, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...PENTAGON_OPTIONS,
          // override the default fill, stroke and strokeWidth with the current values
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          strokeDashArray,
        }
      );
      addObjectToCanvas(hexagonObject);
    },
    addFillColor: (color: string) => {
      setFillColor(color);
      // const activeObject = canvas.getActiveObject();
      // if (activeObject) {
      //   activeObject.set({ fill: color });
      // }
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: color });
      });
      // This is required to re-render the canvas after changing the fill color
      canvas.renderAll();
    },
    addFontFamily: (fontFamily: string) => {
      setFontFamily(fontFamily);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          (object as fabric.Textbox).set({ fontFamily });
        }
      });
      canvas.renderAll();
    },
    addFontWeight: (fontWeight: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          (object as fabric.Textbox).set({ fontWeight });
        }
      });
      canvas.renderAll();
    },
    // 🚨 TODO: Use ITextOptions with pick instead
    addFontStyle: (fontStyle: "italic" | "normal") => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          (object as fabric.Textbox).set({ fontStyle });
        }
      });
      canvas.renderAll();
    },
    addFontAlign: (textAlign: ITextOptions["textAlign"]) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          (object as fabric.Textbox).set({ textAlign });
        }
      });
      canvas.renderAll();
    },
    addFontSize: (fontSize: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          (object as fabric.Textbox).set({ fontSize });
        }
      });
      canvas.renderAll();
    },
    deleteObjects: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.remove(object);
      });
      // Clear the active object
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    toggleUnderline: () => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          const textObject = object as fabric.Textbox;
          const currentUnderline = textObject.get("underline");
          const newUnderline = !currentUnderline;
          textObject.set({ underline: newUnderline });
        }
      });
      canvas.renderAll();
    },
    toggleLineThrough: () => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          const textObject = object as fabric.Textbox;
          const currentLineThrough = textObject.get("linethrough");
          const newLineThrough = !currentLineThrough;
          textObject.set({ linethrough: newLineThrough });
        }
      });
      canvas.renderAll();
    },
    toggleCase: () => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return; // Exit if no active objects

      activeObjects.forEach((object) => {
        if (isTextType(object.type)) {
          const textObject = object as fabric.Textbox;
          const currentText = textObject.get("text") as string;

          // Check if the text is currently in uppercase, and toggle it
          const newText =
            currentText === currentText.toUpperCase()
              ? currentText.toLowerCase()
              : currentText.toUpperCase();

          textObject.set({ text: newText });
        }
      });

      canvas.renderAll();
    },
    addStrokeColor: (color: string) => {
      setStrokeColor(color);
      canvas.getActiveObjects().forEach((object) => {
        // Hack to set the color of the text object because text object does not have a stroke property
        if (isTextType(object.type)) {
          object.set({ fill: color });
          return;
        }
        object.set({ stroke: color });
      });
      canvas.renderAll();
    },
    addStrokeWidth: (width: number) => {
      setStrokeWidth(width);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: width });
      });
      canvas.renderAll();
    },
    addStrokeDashArray: (dashArray: number[]) => {
      setStrokeDashArray(dashArray);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: dashArray });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });
      canvas.renderAll();
    },
    canvas,
    addObjectOpacity: (opacity: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity });
      });
      canvas.renderAll();
    },
    fillColor, // editor fill color
    getActiveObjectFillColor: () => {
      const activeObject = selectedObjects[0];

      if (activeObject) {
        return (activeObject.get("fill") as string) ?? fillColor; // active object fill color
      }
      return fillColor;
    },
    getActiveObjectFontFamily: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (activeObject as fabric.Textbox).get("fontFamily") ?? fontFamily; // active object fill color
      }
      return fillColor;
    },
    getActiveObjectFontWeight: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (
          ((activeObject as fabric.Textbox).get("fontWeight") as number) ??
          FONT_WEIGHT
        );
      }
      return FONT_WEIGHT;
    },
    getActiveObjectUnderline: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (
          ((activeObject as fabric.Textbox).get("underline") as boolean) ??
          false
        );
      }
      return false;
    },
    getActiveObjectFontSize: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (activeObject as fabric.Textbox).get("fontSize") ?? FONT_SIZE;
      }
      return FONT_SIZE;
    },
    getActiveObjectLineThrough: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (
          ((activeObject as fabric.Textbox).get("linethrough") as boolean) ??
          false
        );
      }
      return false;
    },
    getActiveObjectTextCase: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        const textObject = activeObject as fabric.Textbox;
        const currentText = textObject.get("text") as string;

        // Check if the text is currently in uppercase
        return currentText === currentText.toUpperCase()
          ? "uppercase"
          : "normal";
      }
      return "normal";
    },
    getActiveObjectFontStyle: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (
          ((activeObject as fabric.Textbox).get("fontStyle") as
            | "italic"
            | "normal") ?? "normal"
        );
      }
      return "normal";
    },
    getActiveFontAlign: () => {
      const activeObject = selectedObjects[0];

      if (activeObject && isTextType(activeObject.type)) {
        return (activeObject as fabric.Textbox).get("textAlign") ?? "left";
      }
      return "left";
    },
    getActiveObjectStrokeColor: () => {
      const activeObject = selectedObjects[0];

      if (activeObject) {
        return activeObject.get("stroke") ?? strokeColor;
      }
      return strokeColor;
    },
    getActiveObjectStrokeWidth: () => {
      const activeObject = selectedObjects[0];

      if (activeObject) {
        return activeObject.get("strokeWidth") ?? strokeWidth;
      }
      return strokeWidth;
    },
    getActiveObjectStrokeDashArray: () => {
      const activeObject = selectedObjects[0];

      if (activeObject) {
        return activeObject.get("strokeDashArray") ?? strokeDashArray;
      }
      return strokeDashArray;
    },
    getActiveObjectOpacity: () => {
      const activeObject = selectedObjects[0];

      if (activeObject) {
        return activeObject.get("opacity") ?? OPACITY;
      }
      return 1;
    },
    // getActiveObjectImageFilters: () => {
    //   const activeObject = selectedObjects[0];
    //   console.log("activeObject", activeObject as fabric.Image);

    //   if (activeObject && activeObject.type === "image") {
    //     return (activeObject as fabric.Image).get("filters") ?? [];
    //   }
    //   return [];
    // },
    strokeColor,
    strokeWidth,
    selectedObjects,
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });
      canvas.renderAll();
      const workspace = getWorkSpace();
      if (workspace) {
        workspace.sendToBack();
      }
    },
  };
};

type Props = {
  selectionClearedCallback: () => void;
};

const useEditor = ({ selectionClearedCallback }: Props) => {
  const [canvasWrapper, setCanvasWrapper] = useState<HTMLDivElement | null>(
    null
  );
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  // 🚨 TODO: Check why "^_" is not being ignored in eslint
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  // Global Properties for the editor
  const [fillColor, setFillColor] = useState<string>(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState<string>(FILL_COLOR);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);
  const [fontFamily, setFontFamily] = useState<string>(FONT_FAMILY);
  const { copy, paste } = useClipboard({ canvas });

  useCanvasEvents({
    canvas,
    setSelectedObjects,
    selectionClearedCallback,
  });

  useAutoResize({
    canvasWrapper,
    canvas,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return createEditor({
        canvas,
        fillColor,
        fontFamily,
        setFontFamily,
        strokeColor,
        strokeWidth,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        selectedObjects,
        strokeDashArray,
        setStrokeDashArray,
        copy,
        paste,
      });
    }
    return undefined;
  }, [
    canvas,
    fillColor,
    fontFamily,
    strokeColor,
    strokeWidth,
    selectedObjects,
    strokeDashArray,
    copy,
    paste,
  ]);

  const init = useCallback(
    ({
      initialCanvasWrapper,
      initialCanvas,
    }: {
      initialCanvasWrapper: HTMLDivElement;
      initialCanvas: fabric.Canvas;
    }) => {
      console.log("Initializing Editor... 🚀");

      // Set the canvas properties - Object properties
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#8b3dff",
        borderScaleFactor: 2.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 0.8,
        cornerStrokeColor: "#8b3dff",
      });

      // Create a rectangle object to define the workspace of the canvas
      const defaultCanvasWorkspace = new fabric.Rect({
        width: 1080,
        height: 1920,
        name: "defaultCanvasWorkspace",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.3)",
          blur: 10,
        }),
      });
      // Set the height and width of the canvas-container div to the height and width of the canvas wrapper. offsetHeight vs clientHeight: https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
      initialCanvas.setHeight(initialCanvasWrapper.offsetHeight);
      initialCanvas.setWidth(initialCanvasWrapper.offsetWidth);

      // Define the workspace of the canvas
      initialCanvas.add(defaultCanvasWorkspace);
      initialCanvas.centerObject(defaultCanvasWorkspace);
      // element outside the defaultCanvasWorkspace rectangle will not be visible
      initialCanvas.clipPath = defaultCanvasWorkspace;

      // Set the canvas to the state
      setCanvas(initialCanvas);
      setCanvasWrapper(initialCanvasWrapper);

      // Add a rectangle object to the canvas - For testing purposes
      // const rectangleObject = new fabric.Rect({
      //   width: 300,
      //   height: 300,
      //   fill: "red",
      // });

      // initialCanvas.add(rectangleObject);
      // initialCanvas.centerObject(rectangleObject);
    },
    []
  );

  return { init, editor };
};

export { useEditor };
