import React from "react";

const VideoTitle = ({ title, overview }) => {
  return (
    <div className="pt-[20%] px-12 absolute text-white bg-gradient-to-r from-black w-full h-full">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">{title}</h1>
      
      {/* Overview */}
      <p className="text-lg w-1/2 leading-relaxed mb-6 drop-shadow-md">
        {overview}
      </p>
      
      {/* Buttons */}
      <div className="flex gap-4">
        <button className="bg-white text-black py-2 px-6 rounded-md text-lg font-semibold hover:bg-opacity-80 transition">
          ▶️ Play
        </button>
        <button className="bg-gray-700 bg-opacity-70 text-white py-2 px-6 rounded-md text-lg font-semibold hover:bg-gray-600 transition">
          ℹ️ More Info
        </button>
      </div>
    </div>
  );
};

export default VideoTitle;
