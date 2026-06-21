import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = {
  purple: '#DCDDFF',
  yellow: '#FBE6C2',
  green: '#B2F0D1',
  pink: '#FACDD1'
};

const RAW_DATA = [
  { label: 'Jan', values: [ { id: 'purple', val: 30, color: COLORS.purple }, { id: 'yellow', val: 30, color: COLORS.yellow }, { id: 'pink', val: 25, color: COLORS.pink } ] },
  { label: 'Jun', values: [ { id: 'purple', val: 35, color: COLORS.purple }, { id: 'yellow', val: 20, color: COLORS.yellow }, { id: 'green', val: 20, color: COLORS.green } ] },
  { label: 'Aug', values: [ { id: 'purple', val: 25, color: COLORS.purple }, { id: 'yellow', val: 25, color: COLORS.yellow }, { id: 'pink', val: 30, color: COLORS.pink } ] },
  { label: 'Sep', values: [ { id: 'purple', val: 40, color: COLORS.purple }, { id: 'yellow', val: 15, color: COLORS.yellow }, { id: 'green', val: 20, color: COLORS.green }, { id: 'pink', val: 15, color: COLORS.pink } ] },
  { label: 'Oct', values: [ { id: 'purple', val: 30, color: COLORS.purple }, { id: 'yellow', val: 15, color: COLORS.yellow }, { id: 'pink', val: 20, color: COLORS.pink } ] },
  { label: 'Nov', values: [ { id: 'purple', val: 20, color: COLORS.purple }, { id: 'green', val: 25, color: COLORS.green } ] },
  { label: 'Dec', values: [ { id: 'purple', val: 25, color: COLORS.purple }, { id: 'yellow', val: 25, color: COLORS.yellow }, { id: 'green', val: 20, color: COLORS.green }, { id: 'pink', val: 20, color: COLORS.pink } ] },
];

export default function ActivityChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial width
    setWidth(containerRef.current.clientWidth);

    // Watch for resizes
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const height = 120;
  const padding = 20;

  // Compute stacks with D3 logic
  const stackData = useMemo(() => {
     // Prepare data for standard stacked format if needed, 
     // or simply map out rects manually which provides better rounding control.
     // To strictly use d3 scales:
     
     const maxTotal = d3.max(RAW_DATA, d => d3.sum(d.values, v => v.val)) || 100;
     
     const xScale = d3.scaleBand()
        .domain(RAW_DATA.map((_, i) => i.toString()))
        .range([0, width])
        .paddingOuter(0.2)
        .paddingInner(0.3);
        
     const yScale = d3.scaleLinear()
        .domain([0, maxTotal])
        .range([height - padding, padding]);

     return RAW_DATA.map((col, i) => {
       const x = xScale(i.toString()) || 0;
       const barWidth = xScale.bandwidth();
       
       let currentY = height - padding;
       
       // Bottom to top
       const segments = col.values.map((v, j) => {
          const segHeight = (height - padding) - yScale(v.val);
          currentY -= segHeight;
          const y = currentY;
          
          return {
             ...v,
             x,
             y,
             width: barWidth,
             height: segHeight,
             isTop: j === col.values.length - 1,
             isBottom: j === 0
          };
       });

       return { ...col, index: i, x, barWidth, segments };
     });
  }, [width, height]);

  return (
    <div ref={containerRef} className="w-full h-full relative" onMouseLeave={() => setHoveredIndex(null)}>
       <svg width="100%" height={height} className="overflow-visible">
          {/* Subtle grid line */}
          <line x1="0" y1={height - padding + 5} x2={width} y2={height - padding + 5} stroke="#000" strokeOpacity="0.05" />
          
          {stackData.map((col, i) => {
             const isActive = hoveredIndex === i || (hoveredIndex === null && i === stackData.length - 1);
             const offset = isActive ? -2 : 0;
             const scaleX = isActive ? 1.05 : 1;

             return (
               <g key={i} onMouseEnter={() => setHoveredIndex(i)} className="cursor-pointer">
                  {/* Outline for active */}
                  {isActive && (
                      <motion.rect
                        layoutId="activePillOutline"
                        x={col.x - 6}
                        y={col.segments[col.segments.length - 1].y - 8}
                        width={col.barWidth + 12}
                        height={(height - padding) - (col.segments[col.segments.length - 1].y) + 40}
                        rx={16}
                        fill="none"
                        stroke="#111"
                        strokeWidth="2.5"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                  )}

                  {/* Bar segments */}
                  {col.segments.map((seg, j) => (
                    <motion.rect
                      key={seg.id}
                      initial={{ y: height - padding, height: 0, x: seg.x, width: col.barWidth }}
                      animate={{ 
                         y: seg.y + offset, 
                         height: seg.height,
                         x: seg.x - ((col.barWidth * scaleX - col.barWidth) / 2),
                         width: col.barWidth * scaleX
                      }}
                      transition={{ duration: 0.8, delay: i * 0.05 + j * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      fill={seg.color}
                      rx={seg.isTop || seg.isBottom ? 4 : 2}
                    />
                  ))}
               </g>
             );
          })}
       </svg>
       
       {/* HTML Overlay for labels since they include complex background/text styles easier done in HTML */}
       <div className="absolute top-[100px] left-0 right-0 h-[24px] pointer-events-none">
          {stackData.map((col, i) => {
            const isActive = hoveredIndex === i || (hoveredIndex === null && i === stackData.length - 1);
            
            return (
               <div key={i} style={{ position: 'absolute', left: col.x + (col.barWidth / 2), transform: 'translateX(-50%)' }} className="flex justify-center transition-all duration-300">
                   {isActive ? (
                     <motion.div 
                       layoutId="activeLabelBg"
                       className="bg-[#1B1B1B] text-white text-[10px] w-8 h-5 flex items-center justify-center font-medium rounded-full"
                       initial={false}
                       transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                     >
                       {col.label}
                     </motion.div>
                   ) : (
                     <div className="text-[10px] text-center font-medium text-text-muted mt-[4px]">
                       {col.label}
                     </div>
                   )}
               </div>
            );
          })}
       </div>
    </div>
  );
}
