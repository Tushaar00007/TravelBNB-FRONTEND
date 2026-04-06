import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ArrowUp, ArrowDown, MapPin, AlertTriangle, ShoppingBag, Star, X } from 'lucide-react';

function DroppableDay({ dayKey, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? '2px dashed #EA580C' : '2px dashed transparent',
        borderRadius: '16px',
        padding: '8px',
        transition: 'border 0.2s',
        backgroundColor: isOver ? '#FFF7ED' : 'transparent',
        minHeight: '120px',
      }}
    >
      {isOver && (
        <div style={{
          textAlign: 'center',
          color: '#EA580C',
          fontSize: '13px',
          fontWeight: '700',
          padding: '8px',
          marginBottom: '8px',
        }}>
          + Drop here to add to this day
        </div>
      )}
      {children}
    </div>
  );
}

function getItineraryItemId(dayKey, idx, event) {
  return `itinerary-${dayKey}-${event.place_name}-${idx}`;
}

function DraggableItineraryItem({ event, dayKey, idx, onPlaceClick, onMapOpen, moveItem, removeItem, getCrowdColor, isNotAvailable }) {
  const itemId = getItineraryItemId(dayKey, idx, event);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
    data: { type: 'itinerary-item', fromDay: dayKey, fromIndex: idx, placeName: event.place_name, event }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '16px'
      }}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all group cursor-pointer ${isDragging ? 'shadow-xl ring-1 ring-orange-500 z-50 scale-[1.02]' : 'hover:shadow-md hover:border-orange-100 dark:hover:border-orange-900'}`}
      onClick={(e) => {
        console.log("Card clicked:", event);
        if (typeof onPlaceClick === 'function') {
          onPlaceClick(event);
        } else {
          console.warn("onPlaceClick is not a function:", onPlaceClick);
        }
      }}
    >
      <div className="p-4 flex gap-4">
        <div {...listeners} {...attributes} className="flex items-center text-gray-300 dark:text-gray-600 hover:text-orange-500 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
          <GripVertical size={20} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-lg">{event.place_name}</h5>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded uppercase tracking-wider">{event.type}</span>
                <span className="text-[12px] text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase tracking-wider">🕒 {event.time || `${event.visit_time} hrs`}</span>
              </div>
            </div>
            <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); moveItem(dayKey, idx, 'up'); }} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 transition-colors"><ArrowUp size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); moveItem(dayKey, idx, 'down'); }} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 transition-colors"><ArrowDown size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); removeItem(dayKey, idx); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>

          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("VIEW DETAILS clicked, event:", event);
                if (typeof onPlaceClick === 'function') {
                  onPlaceClick(event);
                } else {
                  console.warn("onPlaceClick is not a function:", onPlaceClick);
                }
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold 
              bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 
              text-blue-600 dark:text-blue-400 uppercase tracking-widest px-3 py-1.5 rounded transition-colors"
            >
              📍 VIEW DETAILS
            </button>
          </div>

          {event.crowd_level && (
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                <span>Crowd Level</span>
                <span>{event.crowd_level}/10</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getCrowdColor(event.crowd_level)}`}
                  style={{ width: `${event.crowd_level * 10}%` }}
                ></div>
              </div>
            </div>
          )}

          {event.transport_fares && (isNotAvailable(event.transport_fares.ola_car) || isNotAvailable(event.transport_fares.uber_car)) && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">
                🚕 No Ola/Uber · Use Auto or Local Taxi
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ItineraryEditor = ({
  plannerData,
  setPlannerData,
  SummaryAndTransport,
  TitleAndDownload,
  selectedPlace,
  onPlaceClick,
}) => {
  const isNotAvailable = (v) => {
    if (!v) return false;
    return String(v).toLowerCase().includes('not available');
  };

  const openMap = (place) => {
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };

  const removeItem = (dayKey, index) => {
    setPlannerData((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        [dayKey]: prev.plan[dayKey].filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  };

  const moveItem = (dayKey, index, direction) => {
    setPlannerData((prev) => {
      const list = [...prev.plan[dayKey]];
      if (direction === 'up' && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
      } else if (direction === 'down' && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      }

      return {
        ...prev,
        plan: {
          ...prev.plan,
          [dayKey]: list
        }
      };
    });
  };

  const getCrowdColor = (level) => {
    if (level > 7) return 'bg-red-500';
    if (level > 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col gap-10 items-start relative w-full pb-16">

      <div className="w-full space-y-10">
        {SummaryAndTransport}
        {TitleAndDownload}

        <div className="space-y-12">
          {Object.entries(plannerData.plan || {}).map(([dayKey, events]) => (
            <div key={dayKey} className="relative">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px bg-orange-200 dark:bg-orange-900/40 flex-1"></div>
                <h4 className="text-xs font-bold text-orange-600 dark:text-orange-500 tracking-widest uppercase">
                  {dayKey}
                </h4>
                <div className="h-px bg-orange-200 dark:bg-orange-900/40 flex-1"></div>
              </div>

              <div className="ml-2 md:ml-4 pl-4 md:pl-6 border-l-[3px] border-orange-500 dark:border-orange-600 rounded-bl-xl rounded-tl-xl py-2 relative bg-gray-50/30 dark:bg-transparent">

                <DroppableDay dayKey={dayKey}>
                  <SortableContext
                    items={(events || [])
                      .filter((event) => typeof event === 'object' && event.place_name)
                      .map((event, idx) => getItineraryItemId(dayKey, idx, event))}
                    strategy={verticalListSortingStrategy}
                  >
                  <div className="space-y-4">
                    {events?.map((event, idx) => {
                      const isPlace = typeof event === 'object' && event.place_name;
                      if (!isPlace) {
                        return (
                          <div key={idx} className="px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl text-gray-500 dark:text-gray-400 italic text-sm mb-4">
                            {typeof event === 'string' ? event : event.info}
                          </div>
                        );
                      }

                      return (
                        <DraggableItineraryItem
                          key={`${dayKey}-${event.place_name}-${idx}`}
                          event={event}
                          dayKey={dayKey}
                          idx={idx}
                          onPlaceClick={onPlaceClick}
                          onMapOpen={() => openMap(event)}
                          moveItem={moveItem}
                          removeItem={removeItem}
                          getCrowdColor={getCrowdColor}
                          isNotAvailable={isNotAvailable}
                        />
                      );
                    })}
                  </div>
                  </SortableContext>
                </DroppableDay>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditor;
