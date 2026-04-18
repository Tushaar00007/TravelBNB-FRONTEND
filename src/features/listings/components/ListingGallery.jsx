import React from 'react';
import { Image as ImageIcon, X, ChevronLeft as ChevLeft, ChevronRight as ChevRight } from 'lucide-react';

const ListingGallery = ({ images, openLightbox, lightboxOpen, closeLightbox, prevImage, nextImage, lightboxIndex }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[450px] rounded-[2rem] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 shadow-inner border-4 border-dashed border-gray-200 dark:border-gray-700">
        <ImageIcon size={80} className="mb-4 opacity-50" />
        <p className="font-bold text-2xl">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in delay-100">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 rounded-[2rem] overflow-hidden h-[300px] md:h-[450px] lg:h-[550px] relative shadow-lg">
          <div className="w-full h-full group overflow-hidden cursor-pointer relative" onClick={() => openLightbox(0)}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 w-full h-full"></div>
            <img src={images[0]} alt="Main Property" className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-3 w-full h-full">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="w-full h-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative group cursor-pointer" onClick={() => images[index] && openLightbox(index)}>
                {images[index] ? (
                  <>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 w-full h-full"></div>
                    <img src={images[index]} alt={`Gallery ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {images.length > 5 && (
            <button
              onClick={() => openLightbox(0)}
              className="absolute bottom-6 right-6 z-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-transparent hover:border-gray-900 dark:hover:border-white font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2"
            >
              <ImageIcon size={20} /> Show all {images.length} photos
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button onClick={closeLightbox} className="absolute top-8 right-8 text-white/70 hover:text-white p-2 transition-colors z-50">
            <X size={40} />
          </button>
          <div className="absolute top-8 left-8 text-white/70 font-bold text-lg z-50">
            {lightboxIndex + 1} / {images.length}
          </div>
          
          <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto px-4 md:px-20">
            <button onClick={prevImage} className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50">
              <ChevLeft size={48} />
            </button>
            <img src={images[lightboxIndex]} alt="Gallery" className="max-w-full max-h-[85vh] object-contain select-none shadow-2xl animate-in zoom-in duration-300" />
            <button onClick={nextImage} className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50">
              <ChevRight size={48} />
            </button>
          </div>

          <div className="absolute bottom-10 left-0 right-0 overflow-x-auto px-10 flex justify-center gap-3 no-scrollbar pb-4">
            {images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                onClick={() => openLightbox(i)}
                className={`w-16 h-16 rounded-lg object-cover cursor-pointer transition-all border-2 ${lightboxIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ListingGallery;
