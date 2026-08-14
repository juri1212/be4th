import './Cyclist.css';

const spokes = [0, 30, 60, 90, 120, 150];

function Wheel({ cx, className }) {
  return (
    <g className={`wheel ${className}`}>
      <circle cx={cx} cy="145" r="29" className="tire" />
      <circle cx={cx} cy="145" r="26.5" className="rim" />
      {spokes.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        return <line key={angle} x1={cx} y1="145" x2={cx + 25 * Math.cos(radians)} y2={145 + 25 * Math.sin(radians)} className="spoke" />;
      })}
      <circle cx={cx} cy="145" r="2.2" className="hub" />
    </g>
  );
}

export default function Cyclist() {
  return (
    <svg className="cyclist-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Road cyclist racing">
      <g className="speed-lines" aria-hidden="true">
        <path d="M12 84h43M3 94h34M18 104h25" />
      </g>

      <Wheel cx={52} className="back-wheel" />
      <Wheel cx={148} className="front-wheel" />

      <g className="bike-frame">
        <path d="M52 145L96 128L82 91L126 96L96 128L52 145L82 91" className="frame" />
        <path d="M126 96L148 145" className="fork" />
        <path d="M82 91L79 84L68 84" className="seat-post" />
        <path d="M126 96L135 80L146 80Q149 80 149 84L146 91L140 91" className="handlebars" />
        <path d="M52 145L96 128" className="chain-stay" />
      </g>

      <g className="pedal-group" style={{ transformOrigin: '96px 128px' }}>
        <circle cx="96" cy="128" r="8" className="chainring" />
        <path d="M96 128L104 139M96 128L88 117" className="crank" />
        <path d="M100 140h9M82 116h9" className="pedals" />
      </g>
      <path d="M88 133L52 145M96 136L52 145" className="chain" />

      <g className="rider">
        <path d="M82 91Q94 70 117 69L128 78" className="jersey" />
        <path d="M117 69L137 83L143 88" className="arm" />
        <path d="M120 67L137 78" className="arm arm-back" />
        <circle cx="118" cy="57" r="8" className="face" />
        <path d="M109 56Q111 45 121 45Q130 46 130 53L125 56Z" className="helmet" />
        <path d="M123 58l7-1" className="glasses" />
        <path d="M83 91Q92 106 96 128Q105 135 106 140" className="leg leg-front" />
        <path d="M84 92Q82 113 88 118Q94 121 87 117" className="leg leg-back" />
      </g>
    </svg>
  );
}
