import React from 'react';
import sliclogo from "../../../Images/sliclogo.png"

// Product Card Component
const ProductCard = ({ productCode, name, subtitle, details }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    {/* Product Image */}
    <div className="relative">
      <img 
        src={sliclogo} 
        alt="Product" 
        className="w-full h-auto object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs px-4 py-2">
        <span className="text-gray-300 font-medium">PRODUCT CODE: </span>
        <span className="font-semibold">{productCode}</span>
      </div>
    </div>

    {/* Product Info */}
    <div className="px-5 py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{name}</h2>
      <p className="text-base text-gray-500 mb-5 pb-3 border-b border-gray-200">{subtitle}</p>
      
      <div className="space-y-0">
        {details.map((detail, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4 py-2.5">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wide">{detail.label}</span>
              <p className="text-base font-bold text-gray-900 mt-0.5">{detail.value}</p>
            </div>
            {details[idx + 1] && (
              <div>
                <span className="text-sm text-gray-500 uppercase tracking-wide">{details[idx + 1].label}</span>
                <p className="text-base font-bold text-gray-900 mt-0.5">{details[idx + 1].value}</p>
              </div>
            )}
          </div>
        )).filter((_, idx) => idx % 2 === 0)}
      </div>
    </div>
  </div>
);

export default ProductCard;