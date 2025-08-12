import React, { useContext } from "react";
import { cn } from "../libs/utils";
import { FormHighlightContext } from "../../context/FormHighlightContext";
import { Link as ScrollLink } from "react-scroll";

export const BentoGridPackage = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItemPackage = ({
  className,
  title,
  description,
  points,
  pricing,
}) => {
  const { triggerFormHighlight } = useContext(FormHighlightContext);

  const handleButtonClick = () => {
    console.log("Button clicked");
    triggerFormHighlight();
  };
  return (
    <div
      className={cn(
        "rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-2xl p-4 bg-[#04061c]/80 h-fit",
        className
      )}
    >
      <div className="flex flex-col transition duration-200 group-hover/bento:translate-x-2">
        <div className="my-4 mb-8 font-sans text-3xl font-bold text-center text-white">
          {title}
        </div>
        <div className="font-sans text-lg font-normal text-center text-white/80">
          {description}
        </div>
        <ul className="space-y-4 text-lg font-normal text-white">
          {points &&
            points.map((point, index) => (
              <li
                key={index}
                className="flex items-start transition-colors hover:text-white"
              >
                <span className="mr-4">•</span>
                <div className="flex-1">
                  {typeof point === "string" ? (
                    point
                  ) : (
                    <>
                      <span className="block mb-2 font-semibold">
                        {point.main}
                      </span>
                      <ul className="space-y-2">
                        {point.sub.map((subPoint, subIndex) => (
                          <li key={subIndex} className="flex items-start mr-4">
                            <span className="mr-4 text-white/80">•</span>
                            <span className="text-base text-white/80">
                              {subPoint}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            ))}
        </ul>

        <div className="pt-8 mt-auto">
          <ScrollLink
            to="Process"
            smooth={true}
            duration={500}
            className="cursor-pointer"
            title="ScaleUp - Services"
            aria-label="ScaleUp Services"
          >
            <div className="mx-auto mb-4 w-fit">
              <button
                className="px-6 py-2 text-white transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-r from-[#663bd8] to-[#7d55dd] hover:scale-105"
                onClick={handleButtonClick}
              >
                Get it at {pricing}
              </button>
            </div>
          </ScrollLink>
        </div>
      </div>
    </div>
  );
};
