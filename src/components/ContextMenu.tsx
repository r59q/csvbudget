import React, {useEffect, useRef} from "react";

interface ContextMenuProps {
    visible: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    children: React.ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ visible, position, onClose, children }) => {
    const menuRef = useRef<HTMLUListElement>(null);
    console.log("ContextMenu rendered", { visible, position });
    useEffect(() => {
        if (!visible) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <ul
            ref={menuRef}
            className="fixed bg-gray-900 text-white border border-gray-700 shadow-lg list-none p-0 m-0 z-[1000] min-w-[120px]"
            style={{
                top: position.y,
                left: position.x,
            }}>
            {children}
        </ul>
    );
};

export default ContextMenu;

