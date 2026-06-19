import { useState, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';

function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({ original: null, antipode: null });

  // State with coordinates
  const [coordinates, setCoordinates] = useState(null);

  // theme state
  const [theme, setTheme] = useState('light');

  // Map styles
  const darkMap = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  const lightMap = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

  useEffect(() => {
    // initialize map
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: theme === 'dark' ? darkMap : lightMap,
      zoom: 2,
      minZoom: 1.25,
      center: [0, 20],
    });

    // Enable 3D globe projection 
    mapRef.current.on('styledata', () => {
      if (mapRef.current.getProjection()?.type !== 'globe') {
        mapRef.current.setProjection({ type: 'globe' })
      }
    });

    // Handle clicks
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Calculate antipode
      const antiLat = -lat;
      const antiLng = lng > 0 ? lng - 180 : lng + 180;

      // Update state
      setCoordinates({ lat, lng, antiLat, antiLng })

      // Clear existing markers
      if (markersRef.current.original) markersRef.current.original.remove();
      if (markersRef.current.antipode) markersRef.current.antipode.remove();

      // Draw new markers
      markersRef.current.original = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      markersRef.current.antipode = new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat([antiLng, antiLat])
        .addTo(mapRef.current);

      mapRef.current.flyTo({
        center: [antiLng, antiLat],
        essential: true,
        speed: 0.8,
        zoom: 3
      });
    });

    // Clean map on unmount
    return () => {
      if (mapRef.current) mapRef.current.remove()
    };
  }, []);

  // Watching for theme changes and updates the map
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(theme === 'dark' ? darkMap : lightMap)
    }
  }, [theme]);

  // theme toggle switch function
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  };


  return (
    <div className='relative w-screen h-screen overflow-hidden bg-neutral-900'>
      {/* UI info box overlay */}
      <div className={`absolute top-5 left-5 z-10 max-w-lg p-5 rounded-xl shadow-2xl transition-colors duration-300 border backdrop-blur-md
        ${theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800'
        }`}>

        {/* Header with theme toggle button */}
        <div className='flex items-center justify-between mb-2'>
          <h3 className={`text-lg font-semibold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Antipode Finder
          </h3>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
              ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              // Sun icon (From dark to light)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M4.22 19.78l1.58-1.58M17.66 6.34l1.58-1.58M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            ) : (
              // Moon icon (from light to dark)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>

        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Click anywhere on the globe to find its exact opposite point.
        </p>

        {coordinates ? (
          <div className='space-y-3 text-sm'>
            <div className={`p-2.5 border rounded-lg shadow-md ${theme === 'dark' ? 'bg-blue-850/40 border-blue-900/50' : 'bg-blue-50 border-blue-100'}`}>
              <span className='font-semibold text-blue-500 block mb-0.75'>● Selected Point:</span>
              <span className={`font-mono text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Latitude: {coordinates.lat.toFixed(4)}, Longitude: {coordinates.lng.toFixed(4)}
              </span>
            </div>
            <div className={`p-2.5 border rounded-lg shadow-md ${theme === 'dark' ? 'bg-red-850/40 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
              <span className='font-semibold text-red-500 block mb-0.75'>● Antipode Point:</span>
              <span className={`font-mono text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Latitude: {coordinates.antiLat.toFixed(4)}, Longitude: {coordinates.antiLng.toFixed(4)}
              </span>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-2 text-xs italic py-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`animate-pulse h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'}`} />
            Please drop a pin on a map...
          </div>
        )}
      </div>
      {/* Map element */}
      <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-500
        ${theme === 'dark' ? 'bg-[#030712]' : 'bg-[#e2e8f0]'}`}
      >
        {theme === 'dark' && (
          <div className="absolute w-[68vh] h-[68vh] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none animate-pulse duration-6000" />
        )}
        {theme === 'light' && (
          <div className="absolute w-[66vh] h-[66vh] rounded-full bg-slate-950/30 blur-2xl translate-y-3 pointer-events-none" />
        )}
        <div
          ref={mapContainerRef}
          className="absolute top-0 bottom-0 w-full h-full mix-blend-normal"
        />
      </div>
    </div>
  )
}

export default App
