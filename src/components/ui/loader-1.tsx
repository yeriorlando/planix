import React from "react";
import { cn } from "../../lib/utils";

interface Loader1Props {
  className?: string;
  size?: number;
}

export const Loader1: React.FC<Loader1Props> = ({ className, size = 120 }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center select-none", className)}>
      <style>{`
        .pencil-loader {
          display: block;
        }
        .pencil-loader__stroke {
          animation: pencilStroke-anim 3s ease-in-out infinite;
        }
        .pencil-loader__rotate {
          animation: pencilRotate-anim 3s linear infinite;
        }
        .pencil-loader__body1 {
          animation: pencilBody1-anim 3s ease-in-out infinite;
        }
        .pencil-loader__body2 {
          animation: pencilBody2-anim 3s ease-in-out infinite;
        }
        .pencil-loader__body3 {
          animation: pencilBody3-anim 3s ease-in-out infinite;
        }
        .pencil-loader__eraser {
          animation: pencilEraser-anim 3s ease-in-out infinite;
        }
        .pencil-loader__eraser-skew {
          animation: pencilEraserSkew-anim 3s ease-in-out infinite;
        }
        .pencil-loader__point {
          animation: pencilPoint-anim 3s ease-in-out infinite;
        }

        @keyframes pencilBody1-anim {
          from, to { stroke-dashoffset: 351.86; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 150.8; transform: rotate(-225deg); }
        }
        @keyframes pencilBody2-anim {
          from, to { stroke-dashoffset: 406.84; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 174.36; transform: rotate(-225deg); }
        }
        @keyframes pencilBody3-anim {
          from, to { stroke-dashoffset: 296.88; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 127.23; transform: rotate(-225deg); }
        }
        @keyframes pencilEraser-anim {
          from, to { transform: rotate(-45deg) translate(49px,0); }
          50% { transform: rotate(0deg) translate(49px,0); }
        }
        @keyframes pencilEraserSkew-anim {
          from, 32.5%, 67.5%, to { transform: skewX(0); }
          35%, 65% { transform: skewX(-4deg); }
          37.5%, 62.5% { transform: skewX(8deg); }
          40%, 45%, 50%, 55%, 60% { transform: skewX(-15deg); }
          42.5%, 47.5%, 52.5%, 57.5% { transform: skewX(15deg); }
        }
        @keyframes pencilPoint-anim {
          from, to { transform: rotate(-90deg) translate(49px,-30px); }
          50% { transform: rotate(-225deg) translate(49px,-30px); }
        }
        @keyframes pencilRotate-anim {
          from { transform: translate(100px,100px) rotate(0); }
          to { transform: translate(100px,100px) rotate(720deg); }
        }
        @keyframes pencilStroke-anim {
          from { stroke-dashoffset: 439.82; transform: translate(100px,100px) rotate(-113deg); }
          50% { stroke-dashoffset: 164.93; transform: translate(100px,100px) rotate(-113deg); }
          75%, to { stroke-dashoffset: 439.82; transform: translate(100px,100px) rotate(112deg); }
        }
      `}</style>
      
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${size}px`}
        width={`${size}px`}
        viewBox="0 0 200 200"
        className="pencil-loader text-indigo-600 dark:text-indigo-400"
      >
        <defs>
          <clipPath id="pencil-eraser-clip">
            <rect height="30" width="30" ry="5" rx="5"></rect>
          </clipPath>
        </defs>
        
        {/* Draw path circle */}
        <circle
          transform="rotate(-113,100,100)"
          strokeLinecap="round"
          strokeDashoffset="439.82"
          strokeDasharray="439.82 439.82"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          r="70"
          className="pencil-loader__stroke"
        />
        
        {/* Rotating elements container */}
        <g transform="translate(100,100)" className="pencil-loader__rotate">
          <g fill="none">
            {/* Blue outer arc */}
            <circle
              transform="rotate(-90)"
              strokeDashoffset="402"
              strokeDasharray="402.12 402.12"
              strokeWidth="30"
              stroke="hsl(223,90%,50%)"
              r="64"
              className="pencil-loader__body1"
            />
            {/* Lighter blue middle arc */}
            <circle
              transform="rotate(-90)"
              strokeDashoffset="465"
              strokeDasharray="464.96 464.96"
              strokeWidth="10"
              stroke="hsl(223,90%,60%)"
              r="74"
              className="pencil-loader__body2"
            />
            {/* Darker blue inner arc */}
            <circle
              transform="rotate(-90)"
              strokeDashoffset="339"
              strokeDasharray="339.29 339.29"
              strokeWidth="10"
              stroke="hsl(223,90%,40%)"
              r="54"
              className="pencil-loader__body3"
            />
          </g>
          
          {/* Eraser */}
          <g transform="rotate(-90) translate(49,0)" className="pencil-loader__eraser">
            <g className="pencil-loader__eraser-skew">
              <rect height="30" width="30" ry="5" rx="5" fill="hsl(223,90%,70%)"></rect>
              <rect clipPath="url(#pencil-eraser-clip)" height="30" width="5" fill="hsl(223,90%,60%)"></rect>
              <rect height="20" width="30" fill="hsl(223,10%,90%)"></rect>
              <rect height="20" width="15" fill="hsl(223,10%,70%)"></rect>
              <rect height="20" width="5" fill="hsl(223,10%,80%)"></rect>
              <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)"></rect>
              <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)"></rect>
            </g>
          </g>
          
          {/* Tip */}
          <g transform="rotate(-90) translate(49,-30)" className="pencil-loader__point">
            <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)"></polygon>
            <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)"></polygon>
            <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)"></polygon>
          </g>
        </g>
      </svg>
    </div>
  );
};
