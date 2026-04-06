import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is available
import ItineraryEditor from '../../../components/ItineraryEditor';
import PlaceDetailModal from '../../../components/PlaceDetailModal';
import { Star, CheckCircle } from 'lucide-react';

function DraggablePlaceCard({ place, index, isAdded }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
      id: `ranked-${place.place_name}`, 
      data: { place } 
  });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '8px',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
        transition: 'box-shadow 0.2s',
      }}
      className="relative"
    >
      {isAdded && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-600 rounded-full p-0.5">
          <CheckCircle size={14} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          backgroundColor: 'black', color: 'white',
          borderRadius: '50%', width: '24px', height: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: '800', flexShrink: 0
        }}>#{index + 1}</span>
        <span style={{ fontSize: '10px', color: '#9CA3AF', 
          fontWeight: '700', textTransform: 'uppercase' }}>
          {place.type}
        </span>
      </div>
      <p style={{ fontWeight: '700', fontSize: '13px', 
        color: '#111', margin: '0 0 2px', paddingRight: '20px' }}>
        {place.place_name}
      </p>
      <p style={{ fontSize: '12px', color: '#EA580C', margin: 0 }}>
        ⭐ {place.rating}
      </p>
      <p style={{ fontSize: '10px', color: '#9CA3AF', 
        margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ⠿ Drag to add to itinerary
      </p>
    </div>
  );
}

function RemoveZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'REMOVE_ZONE' });
  return (
    <div
      ref={setNodeRef}
      style={{
        border: `2px dashed ${isOver ? '#DC2626' : '#E5E7EB'}`,
        borderRadius: '12px',
        padding: '12px',
        textAlign: 'center',
        marginBottom: '16px',
        backgroundColor: isOver ? '#FEF2F2' : '#F9FAFB',
        color: isOver ? '#DC2626' : '#9CA3AF',
        fontSize: '13px',
        fontWeight: '700',
        transition: 'all 0.2s',
      }}
    >
      {isOver ? '🗑️ Release to remove' : '🗑️ Drag here to remove'}
    </div>
  );
}

function ItineraryEditorPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { destination, days, startDate, rankedPlaces } = state;
    
    const [plannerData, setPlannerData] = useState(state.plannerData);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    );

    if (!plannerData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
                <h2 className="text-2xl font-bold mb-4">No Itinerary Found</h2>
                <p className="text-gray-500 mb-6">Return to the AI Planner to generate a new itinerary.</p>
                <button
                    onClick={() => navigate('/ai-planner')}
                    className="bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-lg"
                >
                    Go back to Planner
                </button>
            </div>
        );
    }

    const isPlaceAdded = (placeName) => {
        return Object.values(plannerData.plan || {}).some(events => 
            events.some(e => typeof e === 'object' && e.place_name === placeName)
        );
    };

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;
        
        // Remove an item from the itinerary
        if (over.id === 'REMOVE_ZONE' && active.data.current?.fromDay) {
            const { fromDay, fromIndex } = active.data.current;
            setPlannerData(prev => ({
                ...prev,
                plan: {
                    ...prev.plan,
                    [fromDay]: prev.plan[fromDay].filter((_, index) => index !== fromIndex)
                }
            }));
            if (toast && toast.success) toast.success(`Removed from itinerary`);
            return;
        }

        if (active.data.current?.fromDay && typeof over.id === 'string' && over.id !== 'REMOVE_ZONE') {
            const { fromDay, fromIndex } = active.data.current;
            const isOverItem = over.data?.current?.type === 'itinerary-item';
            const targetDay = isOverItem ? over.data.current.fromDay : over.id;

            setPlannerData(prev => {
                if (!prev?.plan?.[fromDay] || !prev?.plan?.[targetDay]) return prev;

                const sourceEvents = [...prev.plan[fromDay]];
                const [movedEvent] = sourceEvents.splice(fromIndex, 1);

                if (!movedEvent) return prev;

                if (fromDay === targetDay) {
                    const targetIndex = isOverItem ? over.data.current.fromIndex : sourceEvents.length;
                    return {
                        ...prev,
                        plan: {
                            ...prev.plan,
                            [fromDay]: arrayMove(prev.plan[fromDay], fromIndex, targetIndex)
                        }
                    };
                }

                const targetEvents = [...prev.plan[targetDay]];
                const targetIndex = isOverItem ? over.data.current.fromIndex : targetEvents.length;
                targetEvents.splice(targetIndex, 0, movedEvent);

                return {
                    ...prev,
                    plan: {
                        ...prev.plan,
                        [fromDay]: sourceEvents,
                        [targetDay]: targetEvents
                    }
                };
            });
            return;
        }

        // Add an item to the itinerary from ranked list
        if (active.data.current?.place && typeof over.id === 'string' && over.id !== 'REMOVE_ZONE') {
            const place = active.data.current.place;
            const isOverItem = over.data?.current?.type === 'itinerary-item';
            const targetDay = isOverItem ? over.data.current.fromDay : over.id;
            
            // Build new event object from the dropped place
            const newEvent = {
                place_name: place.place_name,
                type: place.type,
                city: place.city,
                state: place.state,
                rating: place.rating,
                visit_time: place.visit_time,
                time: 'Flexible',
                crowd_level: place.crowd_level,
                latitude: place.latitude,
                longitude: place.longitude,
                map_link: place.map_link,
                short_description: place.short_description,
                travel_tip: place.travel_tip,
                must_try_food: place.must_try_food,
                transport_fares: place.transport_fares,
                entrance_fee: place.entrance_fee || 0,
                avg_local_transport_cost: place.avg_local_transport_cost || 300,
            };
            
            setPlannerData(prev => ({
                ...prev,
                plan: {
                    ...prev.plan,
                    [targetDay]: (() => {
                        const targetEvents = [...(prev.plan[targetDay] || [])];
                        const targetIndex = isOverItem ? over.data.current.fromIndex : targetEvents.length;
                        targetEvents.splice(targetIndex, 0, newEvent);
                        return targetEvents;
                    })()
                }
            }));
            
            if (toast && toast.success) toast.success(`${place.place_name} added to ${targetDay}!`);
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }} className="bg-gray-50 dark:bg-gray-950 font-sans">
                
                {/* LEFT - Itinerary Editor (scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="pb-24">
                    <div className="max-w-[800px] mx-auto">
                        <div className="flex flex-col mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="w-fit flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-4 font-semibold"
                            >
                                ← Back to Planner
                            </button>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                Edit Itinerary <span className="text-orange-500">{destination}</span>
                            </h1>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800 mt-4">
                            <ItineraryEditor
                                plannerData={plannerData}
                                setPlannerData={setPlannerData}
                                SummaryAndTransport={null}
                                TitleAndDownload={null}
                                selectedPlace={selectedPlace}
                                onSelectedPlaceChange={setSelectedPlace}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT - Top Ranked Sidebar (sticky) */}
                <div style={{ 
                    width: '320px', 
                    flexShrink: 0,
                    borderLeft: '1px solid #E5E7EB',
                    overflowY: 'auto',
                    padding: '24px',
                    backgroundColor: '#FAFAFA',
                    position: 'sticky',
                    top: 0,
                    height: '100%'
                }} className="dark:bg-gray-900 dark:border-gray-800 hidden md:block">
                    <h3 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }} className="text-gray-900 dark:text-white">
                        🏆 Top Ranked Places
                    </h3>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
                        Drag a place onto any day to add it
                    </p>

                    <RemoveZone />

                    {rankedPlaces?.slice(0, 15).map((place, i) => (
                        <DraggablePlaceCard 
                            key={place.place_name} 
                            place={place} 
                            index={i} 
                            isAdded={isPlaceAdded(place.place_name)}
                        />
                    ))}
                </div>

            </div>
            
            <PlaceDetailModal 
                place={selectedPlace} 
                onClose={() => setSelectedPlace(null)} 
            />
        </DndContext>
    );
}

export default ItineraryEditorPage;
