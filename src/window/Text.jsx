import React from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const Text = () => {
    const data = useWindowStore((state) => state.windows.txtfile.data);

    if (!data) return null;

    const { name, subtitle, image, description } = data;

    return (
        <>
            <div id="window-header" className="bg-[#EBEBEB] p-2 flex items-center">
                <WindowsControls target="txtfile" />
                <div className="flex-1 text-center">
                    <h1 className="text-xs font-medium text-gray-600">{name}</h1>
                </div>
            </div>

            <div className="text-content">
                {image && (
                    <div className="mb-4">
                        <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
                    </div>
                )}
                

                
                {subtitle && (
                    <p className="text-lg text-gray-500 mb-4">{subtitle}</p>
                )}

                {description && Array.isArray(description) && (
                    <div className="space-y-4">
                        {description.map((para, index) => (
                            <p key={index} className="leading-relaxed">
                                {para}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const textWindow = WindowWrapper(Text, "txtfile");

export default textWindow;
