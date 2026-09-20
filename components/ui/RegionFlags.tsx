export function FlagTW({ className = 'w-4 h-2.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      className={`${className} rounded-[2px] overflow-hidden inline-block shrink-0 shadow-xs ring-1 ring-white/20 align-middle`}
      aria-label="台湾地区"
    >
      <rect width="900" height="600" fill="#fe0000" />
      <rect width="450" height="300" fill="#000095" />
      <g fill="#ffffff" transform="translate(225,150)">
        <polygon points="0,-150 25,-45 130,-105 55,-25 150,0 55,25 130,105 25,45 0,150 -25,45 -130,105 -55,25 -150,0 -55,-25 -130,-105 -25,-45" />
        <circle r="85" fill="#000095" />
        <circle r="75" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function FlagHK({ className = 'w-4 h-2.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 20"
      className={`${className} rounded-[2px] overflow-hidden inline-block shrink-0 shadow-xs ring-1 ring-white/20 align-middle`}
      aria-label="香港特区"
    >
      <rect width="30" height="20" fill="#ee1c25" />
      <path
        d="M15 10c.8-1.5 2-2.5 3.5-2.2.8.2 1.4.8 1.4 1.7 0 1.2-1.2 2-2.5 2.1-.2 0-.3.2-.2.4.8 1.5.5 3.2-.8 4.1-.7.5-1.6.4-2.1-.3-.7-.9-.5-2.3.4-3.2.2-.2.1-.4-.1-.4-1.6.5-3.2 0-3.8-1.5-.3-.8-.1-1.7.6-2 .9-.5 2.3 0 2.9 1.1.1.2.3.3.4.1.7-1.5 2.4-2.2 3.8-1.5.8.4 1.2 1.2 1 2-.3 1.1-1.5 1.7-2.6 1.3-.2-.1-.4 0-.4.2-.1 1.7-1.4 3-3 3-.8 0-1.6-.4-1.8-1.2-.4-1.1.3-2.3 1.5-2.5.2 0 .3-.2.3-.4-.7-1.5-.2-3.2 1.1-4 .7-.5 1.6-.4 2.1.3.7 1 .5 2.3-.4 3.2-.2.2-.1.4.1.4z"
        fill="#ffffff"
      />
    </svg>
  );
}
