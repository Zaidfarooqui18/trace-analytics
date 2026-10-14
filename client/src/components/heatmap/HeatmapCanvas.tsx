import { useRef, useEffect, useState, useMemo } from 'react';
import { HeatmapPoint, HeatmapCluster } from '../../types';
import { Flame, Info } from 'lucide-react';

interface HeatmapCanvasProps {
  points: HeatmapPoint[];
  clusters: HeatmapCluster[];
  renderMode: 'heat' | 'points' | 'grid';
  radius: number;
  opacity: number;
  showRageOnly: boolean;
  pageUrl: string;
}

export function HeatmapCanvas({
  points,
  clusters,
  renderMode,
  radius,
  opacity,
  showRageOnly,
  pageUrl,
}: HeatmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: HeatmapPoint;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Filter points if rage only
  const filteredPoints = useMemo(() => {
    if (showRageOnly) return points.filter((p) => p.is_rage_click);
    return points;
  }, [points, showRageOnly]);

  // Render canvas based on mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (filteredPoints.length === 0) return;

    if (renderMode === 'heat') {
      // 1. Draw radial gradient alpha circles on an offscreen alpha buffer
      const alphaCanvas = document.createElement('canvas');
      alphaCanvas.width = width * dpr;
      alphaCanvas.height = height * dpr;
      const alphaCtx = alphaCanvas.getContext('2d');
      if (!alphaCtx) return;
      alphaCtx.scale(dpr, dpr);

      // Helper to extract normalized coordinates with mathematical fallbacks
      const getNormCoords = (pt: HeatmapPoint) => {
        let nx = typeof pt.normalized_x === 'number' ? pt.normalized_x : null;
        let ny = typeof pt.normalized_y === 'number' ? pt.normalized_y : null;

        if (nx === null && typeof pt.page_x === 'number' && typeof pt.document_width === 'number' && pt.document_width > 0) {
          nx = pt.page_x / pt.document_width;
        } else if (nx === null && typeof pt.x === 'number' && typeof pt.viewport_width === 'number' && pt.viewport_width > 0) {
          nx = pt.x / pt.viewport_width;
        }

        if (ny === null && typeof pt.page_y === 'number' && typeof pt.document_height === 'number' && pt.document_height > 0) {
          ny = pt.page_y / pt.document_height;
        } else if (ny === null && typeof pt.y === 'number' && typeof pt.viewport_height === 'number' && pt.viewport_height > 0) {
          ny = pt.y / pt.viewport_height;
        }

        return {
          nx: Math.min(Math.max(nx ?? 0.5, 0), 1),
          ny: Math.min(Math.max(ny ?? 0.5, 0), 1),
        };
      };

      filteredPoints.forEach((pt) => {
        const { nx, ny } = getNormCoords(pt);
        const cx = nx * width;
        const cy = ny * height;

        const grad = alphaCtx.createRadialGradient(cx, cy, 2, cx, cy, radius);
        grad.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.9})`);
        grad.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 0.4})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        alphaCtx.fillStyle = grad;
        alphaCtx.beginPath();
        alphaCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        alphaCtx.fill();
      });

      // 2. Colorize alpha buffer into visual heat gradient
      const imgData = alphaCtx.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height);
      const data = imgData.data;

      // Color palette LUT: blue -> cyan -> yellow -> orange -> red
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const ratio = alpha / 255;
          let r = 0, g = 0, b = 0;

          if (ratio < 0.25) {
            r = 0;
            g = Math.round((ratio / 0.25) * 255);
            b = 255;
          } else if (ratio < 0.5) {
            r = 0;
            g = 255;
            b = Math.round((1 - (ratio - 0.25) / 0.25) * 255);
          } else if (ratio < 0.75) {
            r = Math.round(((ratio - 0.5) / 0.25) * 255);
            g = 255;
            b = 0;
          } else {
            r = 255;
            g = Math.round((1 - (ratio - 0.75) / 0.25) * 255);
            b = 0;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = Math.round(alpha * opacity);
        }
      }

      alphaCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(alphaCanvas, 0, 0, width, height);
    } else if (renderMode === 'points') {
      const getNormCoords = (pt: HeatmapPoint) => {
        let nx = typeof pt.normalized_x === 'number' ? pt.normalized_x : null;
        let ny = typeof pt.normalized_y === 'number' ? pt.normalized_y : null;
        if (nx === null && typeof pt.page_x === 'number' && typeof pt.document_width === 'number' && pt.document_width > 0) {
          nx = pt.page_x / pt.document_width;
        } else if (nx === null && typeof pt.x === 'number' && typeof pt.viewport_width === 'number' && pt.viewport_width > 0) {
          nx = pt.x / pt.viewport_width;
        }
        if (ny === null && typeof pt.page_y === 'number' && typeof pt.document_height === 'number' && pt.document_height > 0) {
          ny = pt.page_y / pt.document_height;
        } else if (ny === null && typeof pt.y === 'number' && typeof pt.viewport_height === 'number' && pt.viewport_height > 0) {
          ny = pt.y / pt.viewport_height;
        }
        return {
          nx: Math.min(Math.max(nx ?? 0.5, 0), 1),
          ny: Math.min(Math.max(ny ?? 0.5, 0), 1),
        };
      };

      // Draw individual crisp click points with glow
      filteredPoints.forEach((pt) => {
        const { nx, ny } = getNormCoords(pt);
        const cx = nx * width;
        const cy = ny * height;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, pt.is_rage_click ? 8 : 6, 0, Math.PI * 2);

        if (pt.is_rage_click) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 8;
        }

        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    } else if (renderMode === 'grid') {
      // Draw grid density blocks
      const maxCount = Math.max(...clusters.map((c) => c.count), 1);
      const cellW = width / 20;
      const cellH = height / 20;

      clusters.forEach((cl) => {
        const x = cl.col * cellW;
        const y = cl.row * cellH;
        const intensity = cl.count / maxCount;

        ctx.save();
        ctx.fillStyle = cl.hasRageClick
          ? `rgba(239, 68, 68, ${0.3 + intensity * 0.6})`
          : `rgba(245, 158, 11, ${0.2 + intensity * 0.7})`;
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(x, y, cellW, cellH);

        if (cl.count > 0 && cellW > 25) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cl.count.toString(), x + cellW / 2, y + cellH / 2);
        }
        ctx.restore();
      });
    }
  }, [filteredPoints, clusters, renderMode, radius, opacity]);

  // Handle Mouse Move for tooltips in points mode
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (renderMode !== 'points' || filteredPoints.length === 0) {
      setHoveredPoint(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find closest point within 16px radius
    let closest: HeatmapPoint | null = null;
    let minDist = 20;

    for (const pt of filteredPoints) {
      const nx = typeof pt.normalized_x === 'number' ? pt.normalized_x : 0.5;
      const ny = typeof pt.normalized_y === 'number' ? pt.normalized_y : 0.5;
      const cx = nx * rect.width;
      const cy = ny * rect.height;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      if (dist < minDist) {
        minDist = dist;
        closest = pt;
      }
    }

    if (closest) {
      setHoveredPoint({
        point: closest,
        screenX: mouseX,
        screenY: mouseY,
      });
    } else {
      setHoveredPoint(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Viewport Frame Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        className="relative w-full aspect-[16/10] min-h-[520px] max-h-[720px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden select-none"
      >
        {/* Sleek Browser Window Chrome Top Bar */}
        <div className="h-10 px-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500 inline-block" />
          </div>

          {/* URL bar */}
          <div className="max-w-md w-full px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate text-center border border-slate-200 dark:border-slate-700">
            {pageUrl || 'https://example.com'}
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            {renderMode.toUpperCase()} VIEW
          </div>
        </div>

        {/* Viewport Content Underlay (Wireframe layout so clicks align visually with realistic buttons/headers) */}
        <div className="absolute inset-0 top-10 pointer-events-none opacity-40 dark:opacity-25 p-8 flex flex-col justify-between">
          {/* Mock Nav */}
          <div className="flex justify-between items-center border-b border-dashed border-slate-400 dark:border-slate-700 pb-4">
            <div className="h-4 w-28 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="flex gap-4">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-7 w-20 bg-brand-500/30 rounded-full" />
          </div>

          {/* Mock Hero Area */}
          <div className="my-auto text-center space-y-4 max-w-lg mx-auto">
            <div className="h-7 w-3/4 bg-slate-300 dark:bg-slate-700 rounded mx-auto" />
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
            <div className="flex justify-center gap-3 pt-2">
              <div className="h-9 w-32 bg-brand-500/40 rounded-full" />
              <div className="h-9 w-28 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Mock Grid Cards */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dashed border-slate-400 dark:border-slate-700">
            <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-3 space-y-2">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-3 space-y-2">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-3 space-y-2">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-2/3 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>

        {/* Heatmap Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 top-10 w-full h-[calc(100%-40px)] z-10 cursor-crosshair"
        />

        {/* Hover Point Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              left: Math.min(hoveredPoint.screenX + 16, (containerRef.current?.clientWidth || 600) - 220),
              top: Math.max(hoveredPoint.screenY - 30, 50),
            }}
            className="absolute z-30 pointer-events-none p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700/80 space-y-1 font-mono animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center gap-1.5 font-bold">
              {hoveredPoint.point.is_rage_click ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Rage Click
                </span>
              ) : (
                <span className="text-amber-400">Click Event</span>
              )}
            </div>
            <div className="text-[11px] text-slate-300">
              Normalized: ({hoveredPoint.point.normalized_x}, {hoveredPoint.point.normalized_y})
            </div>
            {hoveredPoint.point.target?.text && (
              <div className="text-[11px] text-brand-300 truncate max-w-[180px]">
                "{hoveredPoint.point.target.text}"
              </div>
            )}
            {hoveredPoint.point.target?.tag && (
              <div className="text-[10px] text-slate-400">
                &lt;{hoveredPoint.point.target.tag}&gt; {hoveredPoint.point.target.id ? `#${hoveredPoint.point.target.id}` : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transparent Disclaimer and Help Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2">
        <Info className="w-4 h-4 text-brand-500 shrink-0" />
        <span>
          Coordinate-based click distribution plotted on a normalized viewport canvas. Coordinates scale responsively and remain accurate across device resolutions.
        </span>
      </div>
    </div>
  );
}
