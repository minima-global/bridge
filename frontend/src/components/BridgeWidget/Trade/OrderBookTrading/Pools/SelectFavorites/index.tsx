import { FormikContextType, FormikValues, useFormikContext } from "formik";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import { useEffect, useState } from "react";
import FavoriteIcon from "../../../../../UI/Icons/FavoriteIcon";

const SelectFavorites = () => {
  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { values, setFieldValue } = formik;
  const { favorites } = values;
  const [info, setInfo] = useState(false);
  const toggleFavorite = () => {
    (window as any).MDS.keypair.set("_orderfavs", !favorites, () => null);

    formik.setFieldValue("favorites", !favorites);
  };

  const toggleInfo = () => {
    setInfo((prevState) => !prevState);
  };

  useEffect(() => {
    (window as any).MDS.keypair.get("_orderfavs", (resp) => {
      const status = resp.value;
      setFieldValue("favorites", status === "true" ? true : false);
    });
  }, []);

  return (
    <>
      <AnimatedDialog
        onClose={() => {
          toggleInfo();
        }}
        isOpen={info}
        position="items-start mt-20"
        extraClass="max-w-sm mx-auto"
        dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
      >
        <>
          <div className="flex justify-between items-center pr-4">
            <div className="grid grid-cols-[auto_1fr] ml-2">
              <FavoriteIcon fill="currentColor" />
              <h3 className="my-auto font-bold ml-2">
                Toggle Favorites Feature
              </h3>
            </div>
            <svg
              onClick={toggleInfo}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="4.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </div>
          <div className="px-4 py-3 text-sm flex flex-col justify-between h-full">
            <p>
              This feature will set up your trades with your favorite counter-parties{" "}
              <b>only</b>. Do you want to switch this feature{" "}
              {!favorites ? "on?" : "off?"}
            </p>
            <div className="grid grid-cols-[1fr_auto] pb-3">
              <div />
              <button
                type="button"
                onClick={() => {
                  toggleFavorite();
                  toggleInfo();
                }}
                className="bg-black text-white font-bold dark:text-black dark:bg-teal-300"
              >
                Yes
              </button>
            </div>
          </div>
        </>
      </AnimatedDialog>

      <label
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center cursor-pointer"
      >
        <input
          checked={favorites}
          onChange={toggleInfo}
          type="checkbox"
          className="sr-only peer"
          id="favoriteCheckbox"
        />
        <label
          htmlFor="favoriteCheckbox"
          className="flex items-center cursor-pointer"
        >
          <span className={`mr-2 ${favorites && "animate-pulse"}`}>
            <FavoriteIcon fill={favorites ? "#5ECED4" : "currentColor"} />
          </span>
        </label>
      </label>
    </>
  );
};

export default SelectFavorites;
