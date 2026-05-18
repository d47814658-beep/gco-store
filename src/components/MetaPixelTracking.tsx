import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

const MetaPixelTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && pixelId !== 'YOUR_PIXEL_ID_HERE') {
      const advancedMatching = {}; // Optional advanced matching params
      const options = {
        autoConfig: true,
        debug: false,
      };
      ReactPixel.init(pixelId, advancedMatching, options);
    }
  }, []);

  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && pixelId !== 'YOUR_PIXEL_ID_HERE') {
      ReactPixel.pageView();
    }
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixelTracking;
