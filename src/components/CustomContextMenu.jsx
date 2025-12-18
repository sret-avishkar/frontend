import React, { useEffect, useRef, useState } from 'react';

const CustomContextMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setMenuVisible(true);
    };

    const handleClick = () => setMenuVisible(false);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const saveAsHTML = () => {
    setMenuVisible(false);
    setTimeout(() => {
      const clone = document.documentElement.cloneNode(true);
      const menu = clone.querySelector('#custom-context-menu');
      if (menu) menu.remove();

      const doctype = '<!DOCTYPE html>\n';
      const html = doctype + clone.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'page.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const goBack = () => window.history.back();
  const goForward = () => window.history.forward();
  const reload = () => window.location.reload();
  const printPage = () => {
    setMenuVisible(false);
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      {/* {menuVisible && (
        <ul
          id="custom-context-menu"
          ref={menuRef}
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            position: 'fixed',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            padding: '4px 0',
            minWidth: '200px',
            listStyle: 'none',
          }}
        >
          <li className="context-item" onClick={goBack}>⬅ Back</li>
          <li className="context-item" onClick={goForward}>➡ Forward</li>
          <li className="context-item" onClick={reload}>🔄 Reload</li>
          <li className="context-item" onClick={saveAsHTML}>💾 Save as...</li>
          <li className="context-item" onClick={printPage}>🖨️ Print...</li>
        </ul>
      )} */}

      <style>{`
        .context-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        .context-item:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </>
  );
};

export default CustomContextMenu;
