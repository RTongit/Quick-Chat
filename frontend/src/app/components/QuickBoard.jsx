"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, LoaderCircle, Minus, Pencil, Save, Square, Type, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MAX_POINTS = 2000;
const MAX_STROKES = 100;
const COLORS = ["#172033", "#2563eb", "#e11d48", "#16a34a", "#9333ea", "#ea580c"];
const TOOLS = [
  { id: "path", label: "Pen", Icon: Pencil },
  { id: "eraser", label: "Eraser", Icon: Eraser },
  { id: "line", label: "Line", Icon: Minus },
  { id: "rect", label: "Rectangle", Icon: Square },
  { id: "text", label: "Text", Icon: Type },
];

function upsertStroke(strokes, nextStroke) {
  const index = strokes.findIndex((stroke) => stroke.id === nextStroke.id);
  if (index === -1) return [...strokes, nextStroke].slice(-MAX_STROKES);
  return strokes.map((stroke) => stroke.id === nextStroke.id ? nextStroke : stroke).slice(-MAX_STROKES);
}

function drawStroke(context, stroke, width, height) {
  if (!stroke.points?.length) return;

  const first = stroke.points[0];
  const last = stroke.points[stroke.points.length - 1];
  const lineWidth = Math.max(1.5, stroke.width * width);

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = lineWidth;

  if (stroke.kind === "text") {
    context.globalCompositeOperation = "source-over";
    context.fillStyle = stroke.color;
    context.font = `600 ${Math.max(16, stroke.width * width * 5)}px Inter, Arial, sans-serif`;
    context.fillText(stroke.text, first.x * width, first.y * height);
    context.restore();
    return;
  }

  context.globalCompositeOperation = stroke.kind === "eraser" ? "destination-out" : "source-over";
  context.strokeStyle = stroke.kind === "eraser" ? "#ffffff" : stroke.color;
  context.beginPath();

  if (stroke.kind === "line") {
    context.moveTo(first.x * width, first.y * height);
    context.lineTo(last.x * width, last.y * height);
  } else if (stroke.kind === "rect") {
    context.rect(
      first.x * width,
      first.y * height,
      (last.x - first.x) * width,
      (last.y - first.y) * height,
    );
  } else {
    context.moveTo(first.x * width, first.y * height);
    for (const point of stroke.points.slice(1)) {
      context.lineTo(point.x * width, point.y * height);
    }
    if (stroke.points.length === 1) {
      context.lineTo(first.x * width + 0.01, first.y * height + 0.01);
    }
  }

  context.stroke();
  context.restore();
}

export default function QuickBoard({ peer, onClose }) {
  const [strokes, setStrokes] = useState([]);
  const [activeTool, setActiveTool] = useState("path");
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  const canvasRef = useRef(null);
  const activeStrokeRef = useRef(null);
  const strokesRef = useRef(strokes);
  const finalizedIdsRef = useRef(new Set());
  const socket = useAuthStore((state) => state.socket);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(bounds.width * ratio);
    const pixelHeight = Math.round(bounds.height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, bounds.width, bounds.height);
    for (const stroke of strokesRef.current) {
      drawStroke(context, stroke, bounds.width, bounds.height);
    }
  }, []);

  useEffect(() => {
    strokesRef.current = strokes;
    drawCanvas();
  }, [strokes, drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const observer = new ResizeObserver(drawCanvas);
    observer.observe(canvas);
    window.addEventListener("resize", drawCanvas);
    drawCanvas();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", drawCanvas);
    };
  }, [drawCanvas]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!socket) return undefined;

    function handlePreview({ fromUserId, stroke, append }) {
      if (fromUserId !== peer._id || !stroke || finalizedIdsRef.current.has(stroke.id)) return;
      setStrokes((current) => {
        if (!append) return upsertStroke(current, stroke);
        const existing = current.find((item) => item.id === stroke.id);
        if (!existing) return upsertStroke(current, stroke);
        const nextPoints = [...existing.points, ...stroke.points.slice(1)];
        return upsertStroke(current, { ...existing, points: nextPoints.slice(-MAX_POINTS) });
      });
    }

    function handleSaved({ fromUserId, stroke }) {
      if (fromUserId !== peer._id || !stroke) return;
      finalizedIdsRef.current.add(stroke.id);
      setStrokes((current) => upsertStroke(current, stroke));
    }

    function handleCleared({ fromUserId }) {
      if (fromUserId !== peer._id) return;
      finalizedIdsRef.current.clear();
      setStrokes([]);
    }

    socket.on("quickboard:preview", handlePreview);
    socket.on("quickboard:stroke-saved", handleSaved);
    socket.on("quickboard:cleared", handleCleared);

    let cancelled = false;
    async function loadBoard() {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/quickboard/${peer._id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load the shared board.");
        if (!cancelled) {
          for (const stroke of result) finalizedIdsRef.current.add(stroke.id);
          setStrokes((current) => result.reduce((merged, stroke) => upsertStroke(merged, stroke), current));
        }
      } catch (error) {
        if (!cancelled) toast.error(error.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadBoard();

    return () => {
      cancelled = true;
      socket.off("quickboard:preview", handlePreview);
      socket.off("quickboard:stroke-saved", handleSaved);
      socket.off("quickboard:cleared", handleCleared);
    };
  }, [peer._id, socket]);

  function getNormalizedPoint(event) {
    const bounds = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
  }

  async function persistStroke(stroke) {
    setSavingCount((count) => count + 1);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quickboard/${peer._id}/strokes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stroke }),
      });
      const savedStroke = await response.json();
      if (!response.ok) throw new Error(savedStroke.message || "Could not save that drawing.");
      finalizedIdsRef.current.add(savedStroke.id);
      setStrokes((current) => upsertStroke(current, savedStroke));
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setSavingCount((count) => Math.max(0, count - 1));
    }
  }

  function addTextAt(point) {
    const text = textValue.trim();
    if (!text) {
      toast("Type a label first, then click the board.");
      return;
    }

    const stroke = {
      id: crypto.randomUUID(),
      kind: "text",
      color: activeColor,
      width: 0.004,
      points: [point],
      text,
    };
    setStrokes((current) => [...current, stroke]);
    setTextValue("");
    void persistStroke(stroke);
  }

  function beginStroke(event) {
    if (isLoading || isClearing) return;
    const point = getNormalizedPoint(event);
    if (activeTool === "text") {
      addTextAt(point);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = {
      id: crypto.randomUUID(),
      kind: activeTool,
      color: activeColor,
      width: activeTool === "eraser" ? 0.02 : 0.003,
      points: [point],
    };
    activeStrokeRef.current = stroke;
    setStrokes((current) => [...current, stroke]);
  }

  function extendStroke(event) {
    const activeStroke = activeStrokeRef.current;
    if (!activeStroke) return;

    const point = getNormalizedPoint(event);
    const previousPoint = activeStroke.points[activeStroke.points.length - 1];
    if (activeStroke.points.length >= MAX_POINTS) return;

    const nextPoints = activeStroke.kind === "path" || activeStroke.kind === "eraser"
      ? [...activeStroke.points, point]
      : [activeStroke.points[0], point];
    const nextStroke = { ...activeStroke, points: nextPoints };
    activeStrokeRef.current = nextStroke;
    setStrokes((current) => upsertStroke(current, nextStroke));

    if (socket) {
      const previewStroke = nextStroke.kind === "path" || nextStroke.kind === "eraser"
        ? { ...nextStroke, points: [previousPoint, point] }
        : nextStroke;
      socket.emit("quickboard:preview", {
        peerId: peer._id,
        stroke: previewStroke,
        append: nextStroke.kind === "path" || nextStroke.kind === "eraser",
      });
    }
  }

  function finishStroke(event) {
    if (!activeStrokeRef.current) return;
    extendStroke(event);
    const completedStroke = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (completedStroke) void persistStroke(completedStroke);
  }

  async function clearBoard() {
    if (!strokes.length || isClearing) return;
    if (!window.confirm("Clear this shared board for both of you?")) return;

    setIsClearing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quickboard/${peer._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not clear the board.");
      finalizedIdsRef.current.clear();
      setStrokes([]);
      toast.success("Shared board cleared.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsClearing(false);
    }
  }

  async function saveSnapshotToChat() {
    const canvas = canvasRef.current;
    if (!canvas || !strokes.length || savingCount > 0) return;
    try {
      const image = canvas.toDataURL("image/png");
      const message = await sendMessage({ image });
      if (!message) return;
      toast.success("Board snapshot sent to chat.");
    } catch (error) {
      toast.error(error.message || "Could not send the board snapshot.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-2 sm:p-5" role="dialog" aria-modal="true" aria-label="Shared QuickBoard">
      <section className="flex h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold sm:text-xl">QuickBoard</h2>
            <p className="truncate text-xs text-base-content/60 sm:text-sm">Shared with {peer.fullName}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close QuickBoard">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-base-300 px-3 py-2 sm:px-5">
          <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Drawing tools">
            {TOOLS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTool(id)}
                className={`btn btn-sm gap-1.5 ${activeTool === id ? "btn-primary" : "btn-ghost"}`}
                aria-pressed={activeTool === id}
                title={label}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-base-300 pl-2" aria-label="Pen color">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`size-6 rounded-full border-2 ${activeColor === color ? "border-primary ring-2 ring-primary/30" : "border-base-300"}`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
                aria-label={`Use ${color} ink`}
                aria-pressed={activeColor === color}
              />
            ))}
          </div>

          {activeTool === "text" && (
            <input
              className="input input-bordered input-sm min-w-32 flex-1 sm:max-w-xs"
              placeholder="Type, then click the board"
              value={textValue}
              maxLength={200}
              onChange={(event) => setTextValue(event.target.value)}
              aria-label="Text to place on the board"
            />
          )}
        </div>

        <main className="relative m-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-base-300 bg-white sm:m-5">
          <canvas
            ref={canvasRef}
            className={`h-full w-full touch-none bg-white ${activeTool === "text" ? "cursor-text" : "cursor-crosshair"}`}
            onPointerDown={beginStroke}
            onPointerMove={extendStroke}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            aria-label="Shared drawing canvas"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-base-content/60">
              <LoaderCircle className="mr-2 size-5 animate-spin" /> Loading shared board…
            </div>
          )}
        </main>

        <footer className="flex flex-col gap-2 border-t border-base-300 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-base-content/60 sm:text-sm">
            {activeTool === "text" ? "Type a label, then click where it should go." : "Draw together; your changes sync live."}
            {savingCount > 0 ? " Saving…" : ""}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={clearBoard} disabled={!strokes.length || isClearing}>
              {isClearing ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Clear
            </button>
            <button type="button" className="btn btn-primary btn-sm gap-1" onClick={saveSnapshotToChat} disabled={!strokes.length || savingCount > 0}>
              {savingCount > 0 ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save to chat
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
