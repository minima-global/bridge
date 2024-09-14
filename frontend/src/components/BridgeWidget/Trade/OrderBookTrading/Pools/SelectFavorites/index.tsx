import { FormikContextType, FormikValues, useFormikContext } from "formik";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import { useEffect, useState } from "react";
import FavoriteIcon from "../../../../../UI/Icons/FavoriteIcon";
import CloseIcon from "../../../../../UI/Icons/CloseIcon";
import { primaryButtonStyle } from "../../../../../../styles";

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
        dismiss={() => {
          toggleInfo();
        }}
        display={info}
      >
        <>
          <div className="flex justify-between items-center pr-4">
            <div className="grid grid-cols-[auto_1fr] ml-2">
              <FavoriteIcon fill="currentColor" />
              <h3 className="my-auto font-bold ml-2">
                Toggle Favorites Feature
              </h3>
            </div>
            <span onClick={toggleInfo}>
              <CloseIcon fill="currentColor" />{" "}
            </span>
          </div>
          <div className="px-4 py-3 text-sm flex flex-col justify-between">
            <p className="mt-4">
              This feature will set up your trades with your favorite
              counter-parties <b>only</b>. Do you want to switch this feature{" "}
              {!favorites ? "on?" : "off?"}
            </p>
            <div className="grid grid-cols-[1fr_auto] pb-3 mt-4">
              <div />
              <button
                type="button"
                onClick={() => {
                  toggleFavorite();
                  toggleInfo();
                }}
                className={primaryButtonStyle}
              >
                {!favorites ? "Turn on" : "Turn off"}
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
