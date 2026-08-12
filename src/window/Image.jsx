import React from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const Image = () => {
    const data = useWindowStore((state) => state.windows.imgfile.data);

    if (!data) return null;

    const { name, imageUrl } = data;

    return (
        <>
            <div id="window-header">
                <WindowsControls target="imgfile" />
                <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-gray-600">{name}</span>
                </div>
            </div>

            <div className="preview bg-white flex flex-col items-center justify-center p-4 min-w-[300px] min-h-[300px]">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={name} 
                        className="max-w-full h-auto object-contain rounded"
                    />
                ) : (
                    <div className="text-gray-400 italic">No image available</div>
                )}
                <p className="mt-2 text-sm font-semibold text-gray-700">{name}</p>
            </div>
        </>
    );
};

const imageWindow = WindowWrapper(Image, "imgfile");

export default imageWindow;
