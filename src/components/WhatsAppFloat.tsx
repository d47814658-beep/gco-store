import { getWhatsAppBase } from '@/lib/whatsapp';

const WhatsAppFloat = () => {
  return (
    <a
      href={getWhatsAppBase()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter GCO Store sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-whatsapp shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* WhatsApp official icon — transparent background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 175.216 175.552"
        className="w-8 h-8"
        fill="none"
      >
        <defs>
          <linearGradient id="wa-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163"/>
            <stop offset="1" stopColor="#23b33a"/>
          </linearGradient>
        </defs>
        <path
          fill="#fff"
          d="M87.609 0C39.268 0 0 39.268 0 87.608c0 16.719 4.73 32.35 12.93 45.574L.518 171.669l39.988-11.836A87.406 87.406 0 0087.609 175.22c48.34 0 87.607-39.268 87.607-87.612C175.216 39.268 135.95 0 87.61 0z"
        />
        <path
          fill="url(#wa-grad)"
          d="M87.609 15.274c-39.93 0-72.334 32.404-72.334 72.334 0 15.83 5.12 30.51 13.795 42.38L19.986 157.5l28.556-8.453A72.138 72.138 0 0087.61 159.942c39.929 0 72.333-32.404 72.333-72.334 0-39.93-32.404-72.334-72.333-72.334z"
        />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M66.822 54.773c-1.73-3.85-3.554-3.928-5.198-3.998-1.347-.058-2.886-.054-4.425-.054-1.538 0-4.04.578-6.157 2.886-2.117 2.31-8.08 7.888-8.08 19.241s8.272 22.32 9.424 23.858c1.154 1.54 16.043 25.797 39.585 35.12 19.58 7.726 23.556 6.192 27.802 5.807 4.246-.384 13.704-5.615 15.628-11.038 1.924-5.422 1.924-10.075 1.347-11.038-.578-.963-2.118-1.54-4.427-2.694-2.308-1.154-13.703-6.767-15.82-7.534-2.117-.769-3.657-1.154-5.195 1.153-1.54 2.31-5.969 7.535-7.315 9.075-1.347 1.54-2.694 1.733-5.003.578-2.308-1.154-9.734-3.588-18.548-11.46-6.858-6.12-11.489-13.678-12.836-15.987-1.346-2.308-.144-3.558 1.012-4.71 1.037-1.034 2.31-2.693 3.463-4.04 1.155-1.347 1.54-2.31 2.31-3.848.77-1.54.384-2.886-.193-4.04-.578-1.154-5.05-12.584-7.154-17.277z"
          clipRule="evenodd"
        />
      </svg>
    </a>
  );
};

export default WhatsAppFloat;
