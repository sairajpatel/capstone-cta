import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaFont } from 'react-icons/fa';

const TextSizeControls = () => {
  const [textSize, setTextSize] = useState(100);

  const increaseSize = () => {
    if (textSize < 150) {
      const newSize = textSize + 10;
      setTextSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
      localStorage.setItem('preferredTextSize', newSize);
    }
  };

  const decreaseSize = () => {
    if (textSize > 70) {
      const newSize = textSize - 10;
      setTextSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
      localStorage.setItem('preferredTextSize', newSize);
    }
  };

  const resetSize = () => {
    setTextSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem('preferredTextSize', 100);
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('preferredTextSize');
    if (savedSize) {
      setTextSize(Number(savedSize));
      document.documentElement.style.fontSize = `${savedSize}%`;
    }
  }, []);

  return (
    <div className="border-b border-[#3d3b54] bg-[#1C1B29]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-end h-10">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Text Size:</span>
            <div className="flex items-center bg-[#2B293D] rounded-lg p-1">
              <button
                onClick={decreaseSize}
                disabled={textSize <= 70}
                className={`p-1.5 rounded transition-colors ${
                  textSize <= 70 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-white hover:bg-[#322f5d]'
                }`}
                title="Decrease text size"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <button
                onClick={resetSize}
                className="px-2 py-1 rounded transition-colors text-white hover:bg-[#322f5d] flex items-center gap-1.5"
                title="Reset text size"
              >
                <FaFont className="w-3 h-3" />
                <span className="text-sm font-medium min-w-[3rem]">{textSize}%</span>
              </button>
              <button
                onClick={increaseSize}
                disabled={textSize >= 150}
                className={`p-1.5 rounded transition-colors ${
                  textSize >= 150 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-white hover:bg-[#322f5d]'
                }`}
                title="Increase text size"
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSizeControls; 