import { cn } from "../utils/cn";
import { Map, Marker } from "@vis.gl/react-google-maps";
import GoogleMapsProvider from "./shared/GoogleMapsProvider";

export default function PropertyTypeCard({ 
  icon: Icon, 
  label, 
  selected, 
  onClick,
  lat,
  lng,
  zoom = 13
}) {
  const hasLocation = lat !== undefined && lng !== undefined;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all overflow-hidden",
        selected
          ? "border-orange-500 bg-orange-50 shadow-lg ring-2 ring-orange-500/20"
          : "border-gray-200 dark:border-gray-800 hover:shadow-md hover:scale-[1.02] dark:hover:bg-gray-800/50",
        hasLocation ? "items-stretch p-0 aspect-square min-w-[200px]" : "p-6"
      )}
    >
      {hasLocation ? (
        <div className="relative w-full h-full group">
          <GoogleMapsProvider>
            <Map
              defaultCenter={{ lat, lng }}
              defaultZoom={zoom}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              className="w-full h-full"
            >
              <Marker position={{ lat, lng }} />
            </Map>
          </GoogleMapsProvider>
          <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 pointer-events-none transition-transform group-hover:translate-y-[-4px]">
             <span className={cn("text-[10px] font-black uppercase tracking-tight block text-center", selected ? "text-orange-700" : "text-gray-800 dark:text-gray-200")}>
                {label}
              </span>
          </div>
        </div>
      ) : (
        <>
          {Icon && <Icon className={cn("w-8 h-8 transition-colors", selected ? "text-orange-600" : "text-gray-700 dark:text-gray-400")} />}
          <span className={cn("text-xs font-bold uppercase tracking-tight transition-colors", selected ? "text-orange-700" : "text-gray-800 dark:text-gray-200")}>
            {label}
          </span>
        </>
      )}
    </div>
  );
}
