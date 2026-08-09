import React from 'react';

interface PlayerInfo {
  name: string;
  isServer: boolean;
  isReceiver: boolean;
}

interface CourtDiagramProps {
  topLeft: PlayerInfo;
  bottomLeft: PlayerInfo;
  topRight: PlayerInfo;
  bottomRight: PlayerInfo;
  servingTeam: 'A' | 'B';
  teamAOnLeft?: boolean;
  compact?: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function PlayerBadge({
  x, y, info, teamColor, size = 22
}: {
  x: number; y: number; info: PlayerInfo; teamColor: string; size?: number;
}) {
  const bgColor = info.isServer ? '#22C55E' : info.isReceiver ? '#F59E0B' : teamColor;
  const label = info.isServer ? 'S' : info.isReceiver ? 'R' : '';
  const initials = getInitials(info.name);
  const fontSize = size * 0.38;
  const labelSize = size * 0.32;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={bgColor}
        stroke={info.isServer ? '#86EFAC' : info.isReceiver ? '#FCD34D' : 'rgba(255,255,255,0.2)'}
        strokeWidth={info.isServer || info.isReceiver ? 2 : 1}
      />
      {(info.isServer || info.isReceiver) && (
        <circle cx={x} cy={y} r={size + 4} fill="none" stroke={bgColor} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.6" />
      )}
      <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">
        {initials}
      </text>
      {label && (
        <text x={x} y={y + fontSize * 0.85} textAnchor="middle" dominantBaseline="middle" fontSize={labelSize} fill="rgba(255,255,255,0.9)" fontWeight="600" fontFamily="Inter, sans-serif">
          {label}
        </text>
      )}
    </g>
  );
}

export function CourtDiagram({ topLeft, bottomLeft, topRight, bottomRight, servingTeam, teamAOnLeft = true, compact = false }: CourtDiagramProps) {
  const W = 360;
  const H = compact ? 150 : 180;

  const margin = { x: 18, y: 12 };
  const courtW = W - margin.x * 2;
  const courtH = H - margin.y * 2;

  const x0 = margin.x;
  const x1 = W / 2;
  const x2 = W - margin.x;
  const y0 = margin.y;
  const y2 = H - margin.y;

  // Service lines (relative to half-court width)
  const halfW = courtW / 2;
  const shortSvcFromNet = halfW * 0.30; // short service line
  const longSvcFromBack = courtW * 0.04; // long service line for doubles

  const leftShortSvc = x1 - shortSvcFromNet;
  const rightShortSvc = x1 + shortSvcFromNet;
  const leftLongSvc = x0 + longSvcFromBack;
  const rightLongSvc = x2 - longSvcFromBack;

  // Side trams
  const tramH = courtH * 0.14;
  const innerTop = y0 + tramH;
  const innerBottom = y2 - tramH;
  const centerY = H / 2;

  // Player positions
  const playerSize = compact ? 18 : 22;
  const pLeftX = (x0 + leftShortSvc) / 2 + leftShortSvc * 0.2;
  const pRightX = (rightShortSvc + x2) / 2 - rightShortSvc * 0.02;
  const pTopY = (y0 + centerY) / 2 + 2;
  const pBottomY = (centerY + y2) / 2 - 2;

  // Arrow from server to receiver
  const serverPos = topLeft.isServer ? { x: pLeftX, y: pTopY }
    : bottomLeft.isServer ? { x: pLeftX, y: pBottomY }
    : topRight.isServer ? { x: pRightX, y: pTopY }
    : { x: pRightX, y: pBottomY };

  const receiverPos = topLeft.isReceiver ? { x: pLeftX, y: pTopY }
    : bottomLeft.isReceiver ? { x: pLeftX, y: pBottomY }
    : topRight.isReceiver ? { x: pRightX, y: pTopY }
    : { x: pRightX, y: pBottomY };

  const arrowMidX = W / 2;
  const arrowMidY = (serverPos.y + receiverPos.y) / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ display: 'block' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#22C55E" opacity="0.7" />
        </marker>
        <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D2645" />
          <stop offset="100%" stopColor="#0B1F3A" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width={W} height={H} fill="#080F1E" rx="6" />

      {/* Court background */}
      <rect x={x0} y={y0} width={courtW} height={courtH} fill="url(#courtGrad)" rx="3" />

      {/* Side trams (shaded, out for singles) */}
      <rect x={x0} y={y0} width={courtW} height={tramH} fill="rgba(255,255,255,0.04)" />
      <rect x={x0} y={innerBottom} width={courtW} height={tramH} fill="rgba(255,255,255,0.04)" />

      {/* Court boundary */}
      <rect x={x0} y={y0} width={courtW} height={courtH} fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" rx="3" />

      {/* Inner boundary (tram lines) */}
      <line x1={x0} y1={innerTop} x2={x2} y2={innerTop} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      <line x1={x0} y1={innerBottom} x2={x2} y2={innerBottom} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

      {/* Long service lines for doubles */}
      <line x1={leftLongSvc} y1={innerTop} x2={leftLongSvc} y2={innerBottom} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
      <line x1={rightLongSvc} y1={innerTop} x2={rightLongSvc} y2={innerBottom} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

      {/* Short service lines */}
      <line x1={leftShortSvc} y1={innerTop} x2={leftShortSvc} y2={innerBottom} stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
      <line x1={rightShortSvc} y1={innerTop} x2={rightShortSvc} y2={innerBottom} stroke="rgba(148,163,184,0.5)" strokeWidth="1" />

      {/* Center service lines */}
      <line x1={leftLongSvc} y1={centerY} x2={leftShortSvc} y2={centerY} stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
      <line x1={rightShortSvc} y1={centerY} x2={rightLongSvc} y2={centerY} stroke="rgba(148,163,184,0.5)" strokeWidth="1" />

      {/* Net shadow */}
      <rect x={x1 - 3} y={y0} width={6} height={courtH} fill="rgba(0,0,0,0.3)" />

      {/* Net posts */}
      <circle cx={x1} cy={y0 - 2} r="4" fill="#64748B" />
      <circle cx={x1} cy={y2 + 2} r="4" fill="#64748B" />

      {/* Net */}
      <line x1={x1} y1={y0} x2={x1} y2={y2} stroke="#94A3B8" strokeWidth="2.5" />
      {/* Net mesh lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const ny = y0 + (courtH / 9) * (i + 1);
        return <line key={i} x1={x1 - 2} y1={ny} x2={x1 + 2} y2={ny} stroke="rgba(148,163,184,0.4)" strokeWidth="1" />;
      })}

      {/* Service direction arrow */}
      <path
        d={`M ${serverPos.x} ${serverPos.y} Q ${arrowMidX} ${arrowMidY} ${receiverPos.x} ${receiverPos.y}`}
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.5"
        markerEnd="url(#arrowhead)"
      />

      {/* Team labels — swap when teamAOnLeft is false */}
      <text x={(x0 + x1) / 2} y={y0 - 4} textAnchor="middle" fontSize="8" fill={teamAOnLeft ? '#60A5FA80' : '#A78BFA80'} fontFamily="Inter, sans-serif" fontWeight="700" letterSpacing="1">
        {teamAOnLeft ? 'TEAM A' : 'TEAM B'}
      </text>
      <text x={(x1 + x2) / 2} y={y0 - 4} textAnchor="middle" fontSize="8" fill={teamAOnLeft ? '#A78BFA80' : '#60A5FA80'} fontFamily="Inter, sans-serif" fontWeight="700" letterSpacing="1">
        {teamAOnLeft ? 'TEAM B' : 'TEAM A'}
      </text>

      {/* Player badges */}
      <PlayerBadge x={pLeftX} y={pTopY} info={topLeft} teamColor="#1D4ED8" size={playerSize} />
      <PlayerBadge x={pLeftX} y={pBottomY} info={bottomLeft} teamColor="#1D4ED8" size={playerSize} />
      <PlayerBadge x={pRightX} y={pTopY} info={topRight} teamColor="#7C3AED" size={playerSize} />
      <PlayerBadge x={pRightX} y={pBottomY} info={bottomRight} teamColor="#7C3AED" size={playerSize} />

      {/* Legend */}
      <g transform={`translate(${W - 72}, ${H - 16})`}>
        <circle cx="6" cy="4" r="5" fill="#22C55E" />
        <text x="13" y="7" fontSize="7" fill="rgba(148,163,184,0.7)" fontFamily="Inter, sans-serif">Server</text>
        <circle cx="42" cy="4" r="5" fill="#F59E0B" />
        <text x="49" y="7" fontSize="7" fill="rgba(148,163,184,0.7)" fontFamily="Inter, sans-serif">Rcvr</text>
      </g>
    </svg>
  );
}
