import React from "react";
import { useTranslation } from "react-i18next";

const RightDashboardHeader = ({ title }) => {
  
  const { t, i18n } = useTranslation();
  return (
    <div>
      <section className="p-4">
        <div className={`px-3 py-3 bg-secondary shadow font-semibold font-sans rounded-sm text-gray-100 lg:px-5 ${i18n.language === "ar" ? "text-end" : "text-start"}`}>
          {title}
        </div>
      </section>
    </div>
  );
};

export default RightDashboardHeader;
