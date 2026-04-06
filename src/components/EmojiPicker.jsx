import React, { useEffect, useRef } from 'react';
import Picker from 'emoji-picker-react';

const EmojiPicker = ({ onEmojiClick, onClose }) => {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={pickerRef}
            className="absolute bottom-14 right-0 z-[100] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        >
            <Picker 
                onEmojiClick={(emojiData) => {
                    onEmojiClick(emojiData.emoji);
                    // Don't close immediately to allow multiple emojis
                }}
                autoFocusSearch={false}
                theme="light"
                searchPlaceHolder="Search emojis..."
                width={320}
                height={400}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
            />
        </div>
    );
};

export default EmojiPicker;
