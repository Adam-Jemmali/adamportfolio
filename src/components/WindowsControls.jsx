import useWindowStore from "#store/window.js";

const WindowsControls = ({ target }) => {
    const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();

    return (
        <div className="window-controls">
            <button
                type="button"
                aria-label="Close"
                className="traffic close"
                onClick={() => closeWindow(target)}
            />
            <button
                type="button"
                aria-label="Minimize"
                className="traffic minimize"
                onClick={() => minimizeWindow(target)}
            />
            <button
                type="button"
                aria-label="Maximize"
                className="traffic zoom"
                onClick={() => toggleMaximize(target)}
            />
        </div>
    );
};

export default WindowsControls;
