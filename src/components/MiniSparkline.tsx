import React from 'react';
import { OHLCPoint } from '../types';

interface MiniSparklineProps {
  history?: OHLCPoint[];
  width?: number;
  height?: number;
  isPositive?: boolean;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  history = [],
  width = 64,
  height = 24,
  isPositive = true,
}) => {
  if (!history || history.length < 2) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center text-[10px] text-slate-600 font-mono"
      >
        --
      </div>
    );
  }

  // Use the last 16 points
  const points = history.slice(-16);
  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const pad = 2;
  const usableWidth = width - pad * 2;
  const usableHeight = height - pad * 2;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * usableWidth;
    const y = height - pad - ((p.close - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylineStr = coords.join(' ');
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  const firstPoint = coords[0].split(',');
  const lastPoint = coords[coords.length - 1].split(',');
  const areaPolygon = `${polylineStr} ${lastPoint[0]},${height} ${firstPoint[0]},${height}`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible shrink-0 select-none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polygon points={areaPolygon} fill={fillColor} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylineStr}
      />
      <circle
        cx={parseFloat(lastPoint[0])}
        cy={parseFloat(lastPoint[1])}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
};
