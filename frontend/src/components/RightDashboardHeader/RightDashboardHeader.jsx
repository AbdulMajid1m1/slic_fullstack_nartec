import React from "react";

const RightDashboardHeader = ({ title }) => {
  return (
    <div>
      <section className="p-4">
        <div className="px-3 py-3 bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5">
          {title}
        </div>
      </section>
    </div>
  );
};

export default RightDashboardHeader;
