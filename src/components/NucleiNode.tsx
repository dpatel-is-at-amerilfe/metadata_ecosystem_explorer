import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export const NUC_SIZE = 72;
export const SAT_SIZE = 32;

export type NucleiNodeData = {
  label: string;
  role: 'nucleus' | 'satellite';
  clusterId: string;
  color: string;
  val: number;
  systemCode?: string;
  originalGroup?: string;
  systemType?: string;
  dataZone?: string;
  feeds?: string;
};

const HANDLE_STYLE: React.CSSProperties = {
  opacity: 0,
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1,
  height: 1,
  pointerEvents: 'none',
};

function NucleiNode({ data, selected }: NodeProps & { data: NucleiNodeData; selected?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const isNucleus = data.role === 'nucleus';
  const size = isNucleus ? NUC_SIZE : SAT_SIZE;
  const c = data.color;
  const glowSize = isNucleus ? 28 : 10;
  const glowSizeActive = isNucleus ? 48 : 18;
  const active = selected || hovered;

  return (
    <div
      style={{ position: 'relative', width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="source" position={Position.Left} style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />

      {/* circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 32%, ${c}28 0%, ${c}08 100%)`,
          border: `${isNucleus ? 2 : 1.5}px solid ${active ? c : c + '66'}`,
          boxShadow: active
            ? `0 0 ${glowSizeActive}px ${c}88, 0 0 ${glowSizeActive * 2}px ${c}22`
            : `0 0 ${glowSize}px ${c}44`,
          transition: 'box-shadow 0.25s, border-color 0.25s',
          cursor: isNucleus ? 'pointer' : 'default',
        }}
      />

      {/* nucleus label below */}
      {isNucleus && (
        <div
          style={{
            position: 'absolute',
            top: size + 10,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: 12,
            fontWeight: 700,
            color: active ? c : c + 'cc',
            letterSpacing: '0.04em',
            textShadow: `0 0 14px ${c}55`,
            pointerEvents: 'none',
            transition: 'color 0.2s',
          }}
        >
          {data.label}
        </div>
      )}

      {/* satellite label beside */}
      {!isNucleus && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: size + 6,
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
            fontSize: 8.5,
            fontWeight: 400,
            color: hovered ? c : c + '88',
            pointerEvents: 'none',
            transition: 'color 0.2s',
          }}
        >
          {data.label}
        </div>
      )}

      {/* satellite hover tooltip */}
      {hovered && !isNucleus && data.systemCode && (
        <div
          style={{
            position: 'absolute',
            bottom: size + 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,8,16,0.97)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8,
            padding: '9px 13px',
            zIndex: 9999,
            minWidth: 190,
            fontSize: 11,
            lineHeight: 1.6,
            color: '#cbd5e1',
            pointerEvents: 'none',
            boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px ${c}22`,
          }}
        >
          <div style={{ fontWeight: 700, color: c, marginBottom: 5, fontSize: 12 }}>
            {data.label}
          </div>
          {data.systemCode && (
            <div><span style={{ color: '#475569' }}>Code: </span>{data.systemCode}</div>
          )}
          {data.originalGroup && (
            <div><span style={{ color: '#475569' }}>Group: </span>{data.originalGroup}</div>
          )}
          {data.systemType && (
            <div><span style={{ color: '#475569' }}>Type: </span>{data.systemType}</div>
          )}
          {data.dataZone && (
            <div><span style={{ color: '#475569' }}>Zone: </span>{data.dataZone}</div>
          )}
          {data.feeds && (
            <div><span style={{ color: '#475569' }}>Feeds: </span>{data.feeds}</div>
          )}
        </div>
      )}

      {/* nucleus hover hint */}
      {hovered && isNucleus && (
        <div
          style={{
            position: 'absolute',
            top: -34,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,8,16,0.93)',
            border: `1px solid ${c}44`,
            borderRadius: 6,
            padding: '4px 10px',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            fontSize: 10,
            color: c + 'cc',
            pointerEvents: 'none',
          }}
        >
          click to focus cluster
        </div>
      )}
    </div>
  );
}

export default memo(NucleiNode);
