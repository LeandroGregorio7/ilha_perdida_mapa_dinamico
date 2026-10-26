import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import type { LayerKey, MapPoint } from '../data/island';

interface PointPosition {
  x: number;
  y: number;
}

type DragState =
  | { kind: 'pan'; startX: number; startY: number; originX: number; originY: number }
  | { kind: 'point'; id: string }
  | null;

interface IslandMapProps {
  layers: Record<LayerKey, boolean>;
  points: MapPoint[];
  rainHours: number;
  compare: boolean;
  swipe: number;
  moveMode: boolean;
  onSelectPoint: (id: string) => void;
  zoomSignal: number;
  resetSignal: number;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function IslandMap({
  layers,
  points,
  rainHours,
  compare,
  swipe,
  moveMode,
  onSelectPoint,
  zoomSignal,
  resetSignal,
}: IslandMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 700 });
  const dragRef = useRef<DragState>(null);
  const [positions, setPositions] = useState<Record<string, PointPosition>>({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomSignalRef = useRef(zoomSignal);
  const resetSignalRef = useRef(resetSignal);
  const progress = rainHours / 24;
  const screenScale = Math.max(0.001, Math.min(svgSize.width / 1000, svgSize.height / 700));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const updateSize = () => setSvgSize({ width: svg.clientWidth || 1000, height: svg.clientHeight || 700 });
    updateSize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    observer?.observe(svg);
    window.addEventListener('resize', updateSize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    const delta = zoomSignal - zoomSignalRef.current;
    zoomSignalRef.current = zoomSignal;
    if (delta !== 0) setZoom((current) => clamp(current + delta * 0.16, 0.78, 1.6));
  }, [zoomSignal]);

  useEffect(() => {
    if (resetSignal === resetSignalRef.current) return;
    resetSignalRef.current = resetSignal;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPositions({});
  }, [resetSignal]);

  const rootPoint = (clientX: number, clientY: number): PointPosition | null => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const at = rootPoint(event.clientX, event.clientY);
    if (!at) return;
    const marker = (event.target as Element).closest('[data-map-marker]');
    const markerId = marker?.getAttribute('data-map-marker');
    if (markerId) {
      onSelectPoint(markerId);
      if (moveMode) dragRef.current = { kind: 'point', id: markerId };
      else return;
    } else {
      dragRef.current = {
        kind: 'pan',
        startX: at.x,
        startY: at.y,
        originX: pan.x,
        originY: pan.y,
      };
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const at = rootPoint(event.clientX, event.clientY);
    if (!at) return;
    if (drag.kind === 'pan') {
      setPan({ x: drag.originX + at.x - drag.startX, y: drag.originY + at.y - drag.startY });
    } else {
      setPositions((current) => ({
        ...current,
        [drag.id]: { x: (at.x - pan.x) / zoom, y: (at.y - pan.y) / zoom },
      }));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom((current) => clamp(current + (event.deltaY < 0 ? 0.08 : -0.08), 0.78, 1.6));
  };

  const renderFloodOverlay = () => (
    <g className="storm-overlay" style={{ opacity: progress }}>
      <path d="M560 326 658 297 747 325 690 373 590 374Z" fill="#249bb3" fillOpacity=".7" />
      <path d="M662 307 740 309 788 340 744 375 696 358Z" fill="#44bdd0" fillOpacity=".8" />
      <path d="M495 365 557 340 614 366 580 399 520 391Z" fill="#44bdd0" fillOpacity=".67" />
      <path d="M545 319 Q590 339 625 363 T705 379" fill="none" stroke="#b9f5ef" strokeWidth="5" strokeDasharray="8 8" opacity=".8" />
      <g className="rain-streaks" opacity={progress > 0.18 ? Math.min(.8, progress) : 0}>
        <path d="M585 212 572 242M629 225 616 255M673 235 660 265M717 247 704 277M758 259 745 289" stroke="#e8faff" strokeWidth="3" strokeLinecap="round" />
      </g>
      {progress > 0.6 && <path d="M530 412 603 394 674 420 615 453 550 440Z" fill="#4dbcd0" fillOpacity=".7" />}
    </g>
  );

  const renderPoint = (point: MapPoint) => {
    const position = positions[point.id] ?? { x: point.x, y: point.y };
    const common = { stroke: '#fffdf6', strokeWidth: 3, strokeLinejoin: 'round' as const };
    return (
      <g
        key={point.id}
        data-map-marker={point.id}
        transform={`translate(${position.x} ${position.y})`}
        className={`map-point ${moveMode ? 'moveable' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={point.title}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectPoint(point.id);
          }
        }}
      >
        <circle r="21" fill={point.color} {...common} />
        {point.symbol === 'canoe' && (
          <g fill="none" stroke="#fffdf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-12 3 Q0 12 12 3 L8 9 Q0 13 -8 9Z" fill="#fffdf6" stroke="none" />
            <path d="M-2 -11 4 9" />
            <path d="M-7 -10 9 -6" />
          </g>
        )}
        {point.symbol === 'cave' && (
          <g fill="none" stroke="#fffdf6" strokeWidth="3" strokeLinejoin="round">
            <path d="M-12 7 0 -9 12 7Z" fill="#fffdf6" />
            <path d="M-5 7 Q-5 -1 0 -1 Q5 -1 5 7" stroke={point.color} />
          </g>
        )}
        {point.symbol === 'alert' && (
          <g fill="none" stroke="#fffdf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0 -12 12 9H-12Z" />
            <path d="M0 -5V2M0 6V6.5" />
          </g>
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      className={`island-svg ${moveMode ? 'move-mode' : ''}`}
      viewBox="0 0 1000 700"
      role="group"
      aria-label="Mapa isométrico ilustrado da Ilha Perdida com pontos da história e áreas de risco"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5bc5d0" />
          <stop offset="1" stopColor="#258ba6" />
        </linearGradient>
        <linearGradient id="island-top" x1=".1" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#9acb77" />
          <stop offset="1" stopColor="#5c9c5d" />
        </linearGradient>
        <clipPath id="island-shape">
          <path d="M160 260 448 114 850 284 535 473 153 315Z" />
        </clipPath>
        <clipPath id="swipe-clip">
          <rect x="0" y="0" width={1000 * (swipe / 100)} height="700" />
        </clipPath>
        <filter id="soft-shadow" x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="13" floodColor="#124555" floodOpacity=".24" />
        </filter>
      </defs>
      <rect width="1000" height="700" fill="url(#sea)" />
      <g className="water-lines" fill="none" stroke="#daf7ee" strokeLinecap="round" opacity=".35">
        <path d="M40 155q38-18 76 0t76 0M720 104q30-14 60 0t60 0M60 560q28-13 56 0t56 0M830 515q42-19 84 0" strokeWidth="3" />
        <path d="M94 202q23-11 46 0t46 0M759 171q26-12 52 0t52 0M789 576q25-12 50 0t50 0" strokeWidth="2" />
      </g>
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`} className="map-scene">
        <path d="M177 286 447 142 829 303 536 486 178 337Z" fill="#6f5a47" filter="url(#soft-shadow)" />
        <path d="M178 337 536 486 536 525 178 375Z" fill="#76543b" />
        <path d="M536 486 829 303 829 342 536 525Z" fill="#684a36" />
        <path d="M160 260 448 114 850 284 535 473 153 315Z" fill="url(#island-top)" stroke="#3f7955" strokeWidth="4" />
        <g clipPath="url(#island-shape)">
          <path d="M183 284 448 146 811 294 532 461 167 308Z" fill="#a3cf78" opacity=".42" />
          <path d="M231 284 449 178 746 300 531 425 238 315Z" fill="#78b76d" opacity=".48" />
          <path d="M206 333 Q324 284 408 294 T574 285 Q685 276 779 325" fill="none" stroke="#d3ce85" strokeWidth="10" strokeLinecap="round" strokeDasharray="5 15" opacity=".72" />
          <path d="M446 154 475 224 534 261 584 291" fill="none" stroke="#3c93a0" strokeWidth="17" strokeLinecap="round" opacity=".8" />
          <path d="M446 154 475 224 534 261 584 291" fill="none" stroke="#a3e1d2" strokeWidth="5" strokeLinecap="round" opacity=".75" />
          <path d="M603 300 690 337 743 318" fill="none" stroke="#e8d4a0" strokeWidth="13" strokeLinecap="round" opacity=".7" />
          {layers.coordinates && (
            <g className="grid-lines" stroke="#fffdf1" strokeWidth="1.5" strokeDasharray="7 8" opacity=".42">
              <path d="M250 216 640 383M344 169 731 339M437 127 823 294" />
              <path d="M287 370 578 200M382 411 672 242M478 451 768 284" />
            </g>
          )}
          {layers.vegetation && (
            <g className="forest">
              {[
                [327, 233], [357, 218], [388, 231], [419, 207], [452, 227], [475, 204],
                [504, 227], [534, 211], [566, 231], [590, 246], [385, 262], [420, 275],
                [458, 259], [496, 280], [536, 266], [567, 278], [350, 275], [613, 261],
                [295, 257], [641, 285], [677, 302], [305, 300], [367, 313], [410, 303],
              ].map(([x, y], index) => (
                <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                  <ellipse cy="13" rx="18" ry="8" fill="#406c4b" opacity=".25" />
                  <path d="M0 4 1 21" stroke="#805e3b" strokeWidth="5" strokeLinecap="round" />
                  <path d={`M0 ${index % 3 === 0 ? -18 : -14} ${index % 2 ? -16 : -13} ${index % 3 === 0 ? 2 : 0} ${index % 2 ? -8 : 14} ${index % 3 === 0 ? 1 : 10}Z`} fill={index % 4 === 0 ? '#38815b' : '#438e5c'} stroke="#36734f" strokeWidth="2" />
                  <path d="M0 -13 0 -1" stroke="#80b86b" strokeWidth="2" opacity=".8" />
                </g>
              ))}
            </g>
          )}
          {layers.floodRisk && (
            <g className="risk-zones">
              <path d="M633 326 706 303 768 329 715 359 658 354Z" fill="#efb24f" fillOpacity=".42" stroke="#c77835" strokeWidth="3" strokeDasharray="8 6" />
              <path d="M538 356 589 338 632 363 594 389 552 382Z" fill="#efb24f" fillOpacity=".34" stroke="#c77835" strokeWidth="3" strokeDasharray="7 6" />
            </g>
          )}
          {layers.floodRisk && (compare ? (
            <g clipPath="url(#swipe-clip)">{renderFloodOverlay()}</g>
          ) : (
            renderFloodOverlay()
          ))}
          <g className="shore-grass" fill="#d0d88a" opacity=".8">
            <circle cx="222" cy="297" r="4" /><circle cx="239" cy="307" r="3" /><circle cx="741" cy="301" r="4" />
            <circle cx="736" cy="345" r="3" /><circle cx="506" cy="441" r="4" /><circle cx="448" cy="415" r="3" />
          </g>
        </g>
        {layers.coordinates && (
          <g className="coordinate-tags">
            {['A', 'B', 'C', 'D'].map((letter, index) => <text key={letter} x={251 + index * 142} y="114" className="coord-label">{letter}</text>)}
            {['1', '2', '3', '4'].map((number, index) => <text key={number} x="117" y={230 + index * 72} className="coord-label">{number}</text>)}
          </g>
        )}
        {layers.storyPoints && points.filter((point) => point.id !== 'flood').map(renderPoint)}
        {layers.floodRisk && points.filter((point) => point.id === 'flood').map(renderPoint)}
        {compare && <g className="swipe-marker" transform={`translate(${1000 * (swipe / 100)} 0)`}>
          <path d="M0 0V700" stroke="#fffdf7" strokeWidth="4" strokeDasharray="9 9" opacity=".9" />
          <circle cy="350" r="20" fill="#fffdf7" stroke="#214a54" strokeWidth="3" />
          <path d="M-6 350H6M0 344V356" stroke="#214a54" strokeWidth="2.5" strokeLinecap="round" />
        </g>}
      </g>
      <g className="screen-labels" pointerEvents="none">
        {points.filter((point) => point.id === 'flood' ? layers.floodRisk : layers.storyPoints).map((point) => {
          const position = positions[point.id] ?? { x: point.x, y: point.y };
          const screenX = pan.x + position.x * zoom;
          const screenY = pan.y + position.y * zoom;
          const labelWidth = Math.max(88, point.shortTitle.length * 7.2 + 18);
          const labelY = 24 * zoom * screenScale + 6;
          return (
            <g key={`label-${point.id}`} transform={`translate(${screenX} ${screenY}) scale(${1 / screenScale})`}>
              <rect x={-labelWidth / 2} y={labelY} width={labelWidth} height="24" rx="12" fill="#fffdf5" stroke="#21404a" strokeWidth="1.5" />
              <text x="0" y={labelY + 16} textAnchor="middle" className="map-point-label">{point.shortTitle}</text>
            </g>
          );
        })}
      </g>
      <g className="compass-mark" transform="translate(916 84)" aria-label="Rosa dos ventos, norte">
        <circle r="31" fill="#fffdf3" fillOpacity=".9" />
        <path d="M0 -24 8 0 0 24 -8 0Z" fill="#df7e42" />
        <path d="M-24 0 0 -8 24 0 0 8Z" fill="#287f8a" opacity=".82" />
        <text x="0" y="-39" textAnchor="middle" className="compass-n">N</text>
      </g>
      <g className="map-coordinate-caption">
        <rect x="30" y="624" width="190" height="43" rx="14" fill="#fffdf3" fillOpacity=".92" />
        <path d="M52 645H161" stroke="#214a54" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 638V652M161 638V652" stroke="#214a54" strokeWidth="3" />
        <text x="52" y="639" className="scale-small">0</text>
        <text x="161" y="639" textAnchor="end" className="scale-small">100 m</text>
        <text x="177" y="650" className="scale-note">fictícia</text>
      </g>
    </svg>
  );
}
