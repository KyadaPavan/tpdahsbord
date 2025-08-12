import React, { useContext } from "react";
import { cn } from "../libs/utils";
import { Link as ScrollLink } from "react-scroll";
import { FormHighlightContext } from "../../context/FormHighlightContext";

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[16rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({ className, title, description, pricing }) => {
  const { triggerFormHighlight } = useContext(FormHighlightContext);

  const handleButtonClick = () => {
    console.log("Button clicked");
    triggerFormHighlight();
  };

  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-2xl p-4  justify-between flex flex-col space-y-4 bg-[#04061c]/80",
        className
      )}
    >
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        <div className="my-4 mb-8 font-sans text-3xl font-bold text-center text-white">
          {title}
        </div>
        <div className="font-sans text-lg font-normal text-center text-white/80">
          {description}
        </div>

        <ScrollLink
          to="Process"
          smooth={true}
          duration={500}
          className="cursor-pointer "
          title="ScaleUp - Services"
          aria-label="ScaleUp Services"
        >
          <div className="mx-auto mt-8 w-fit">
            <button
              className="px-6 py-2  text-white transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-r from-[#663bd8] to-[#7d55dd] hover:scale-105"
              onClick={handleButtonClick}
            >
              Get it at {pricing}
            </button>
          </div>
        </ScrollLink>
      </div>
    </div>
  );
};
