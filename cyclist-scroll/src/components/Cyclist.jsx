import { useEffect, useRef } from 'react';
import './Cyclist.css';

export default function Cyclist() {
  return (
    <svg
      className="cyclist-svg"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back wheel */}
      <g className="wheel back-wheel">
        <circle cx="55" cy="145" r="28" fill="none" stroke="#2c2c2c" strokeWidth="3" />
        <circle cx="55" cy="145" r="2" fill="#555" />
        {/* Spokes */}
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1="55"
            y1="145"
            x2={55 + 26 * Math.cos((angle * Math.PI) / 180)}
            y2={145 + 26 * Math.sin((angle * Math.PI) / 180)}
            stroke="#888"
            strokeWidth="0.8"
          />
        ))}
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={`s2-${angle}`}
            x1="55"
            y1="145"
            x2={55 - 26 * Math.cos((angle * Math.PI) / 180)}
            y2={145 - 26 * Math.sin((angle * Math.PI) / 180)}
            stroke="#888"
            strokeWidth="0.8"
          />
        ))}
        {/* Tire tread */}
        <circle cx="55" cy="145" r="28" fill="none" stroke="#444" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Front wheel */}
      <g className="wheel front-wheel">
        <circle cx="145" cy="145" r="28" fill="none" stroke="#2c2c2c" strokeWidth="3" />
        <circle cx="145" cy="145" r="2" fill="#555" />
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1="145"
            y1="145"
            x2={145 + 26 * Math.cos((angle * Math.PI) / 180)}
            y2={145 + 26 * Math.sin((angle * Math.PI) / 180)}
            stroke="#888"
            strokeWidth="0.8"
          />
        ))}
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={`s2-${angle}`}
            x1="145"
            y1="145"
            x2={145 - 26 * Math.cos((angle * Math.PI) / 180)}
            y2={145 - 26 * Math.sin((angle * Math.PI) / 180)}
            stroke="#888"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="145" cy="145" r="28" fill="none" stroke="#444" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Frame */}
      <g className="bike-frame">
        {/* Chain stay - back axle to bottom bracket */}
        <line x1="55" y1="145" x2="100" y2="130" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />
        {/* Seat tube - bottom bracket to seat */}
        <line x1="100" y1="130" x2="90" y2="90" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />
        {/* Top tube - seat to head tube */}
        <line x1="90" y1="90" x2="130" y2="95" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />
        {/* Down tube - head tube to bottom bracket */}
        <line x1="130" y1="95" x2="100" y2="130" stroke="#e63946" strokeWidth="3" strokeLinecap="round" />
        {/* Seat stay - back axle to seat */}
        <line x1="55" y1="145" x2="90" y2="90" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" />
        {/* Fork */}
        <line x1="130" y1="95" x2="145" y2="145" stroke="#c1121f" strokeWidth="2.5" strokeLinecap="round" />
        {/* Handlebar stem */}
        <line x1="130" y1="95" x2="138" y2="82" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        {/* Handlebars */}
        <path d="M132,80 Q138,76 144,82" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        {/* Seat */}
        <ellipse cx="86" cy="87" rx="10" ry="3" fill="#2c2c2c" />
      </g>

      {/* Pedal crank - animated */}
      <g className="pedal-group" style={{ transformOrigin: '100px 130px' }}>
        {/* Crank arm 1 */}
        <line x1="100" y1="130" x2="100" y2="143" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        {/* Pedal 1 */}
        <rect x="95" y="142" width="10" height="3" rx="1" fill="#333" />
        {/* Crank arm 2 */}
        <line x1="100" y1="130" x2="100" y2="117" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        {/* Pedal 2 */}
        <rect x="95" y="115" width="10" height="3" rx="1" fill="#333" />
        {/* Chainring */}
        <circle cx="100" cy="130" r="9" fill="none" stroke="#777" strokeWidth="1.5" />
        <circle cx="100" cy="130" r="3" fill="#666" />
      </g>

      {/* Rider */}
      <g className="rider">
        {/* Body/torso */}
        <path d="M95,88 Q100,65 120,62" fill="none" stroke="#1d3557" strokeWidth="4" strokeLinecap="round" />
        {/* Head */}
        <circle cx="123" cy="56" r="9" fill="#f4a261" />
        {/* Helmet */}
        <path d="M114,54 Q118,42 132,48 Q134,54 128,57" fill="#457b9d" stroke="#457b9d" strokeWidth="1" />
        {/* Helmet visor */}
        <path d="M131,50 L136,52" stroke="#a8dadc" strokeWidth="1.5" strokeLinecap="round" />
        {/* Sunglasses */}
        <path d="M127,55 L132,54" stroke="#1d3557" strokeWidth="2" strokeLinecap="round" />
        {/* Arms */}
        <path d="M108,70 Q120,78 138,80" fill="none" stroke="#f4a261" strokeWidth="3" strokeLinecap="round" />
        {/* Jersey detail */}
        <path d="M98,85 Q102,72 112,68" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" />
        {/* Upper leg to pedal */}
        <g className="legs" style={{ transformOrigin: '95px 88px' }}>
          <path d="M95,88 Q92,110 100,130" fill="none" stroke="#1d3557" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </g>

      {/* Chain */}
      <path
        d="M91,130 Q73,148 55,145"
        fill="none"
        stroke="#888"
        strokeWidth="1"
        strokeDasharray="2,2"
        className="chain"
      />
    </svg>
  );
}
