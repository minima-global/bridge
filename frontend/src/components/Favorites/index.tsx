import { useContext, useEffect, useState } from "react";
import AnimatedDialog from "../UI/AnimatedDialog";
import { appContext } from "../../AppContext";
import FavoriteIcon from "../UI/Icons/FavoriteIcon/index.js";

import {
  addFavourites,
  removeFavourite  
} from "../../../../dapp/js/sql.js";
import Bear from "../UI/Avatars/Bear/index.js";
import AddIcon from "../UI/Icons/AddIcon/index.js";
import RemoveIcon from "../UI/Icons/RemoveIcon/index.js";
import RubbishIcon from "../UI/Icons/RubbishIcon/index.js";
import DoneIcon from "../UI/Icons/DoneIcon/index.js";
import CloseIcon from "../UI/Icons/CloseIcon/index.js";
import PlusIcon from "../UI/Icons/PlusIcon/index.js";
import { useFormikContext } from "formik";

import sanitizeSQLInput from "../../libs/sanitizeSQL.js";

const Favorites = () => {
  const { _promptFavorites, promptFavorites, notify, getAndSetFavorites, _favorites: favorites } = useContext(appContext);  
  const [mode, setMode] = useState<"none" | "delete" | "add">("none");

  const [favToDelete, setFavToDelete] = useState<string[]>([]);
  const [favToAdd, setFavToAdd] = useState({ name: "", uid: "" });

  const formik: any = useFormikContext();

  useEffect(() => {
    if (_promptFavorites) {
      getAndSetFavorites();
    }
  }, [_promptFavorites]);

  const handleSelectAll = (evt) => {
    const checked = evt.target.checked;

    if (checked) {
      setFavToDelete(favorites.map((fav) => fav.ID));
    } else {
      setFavToDelete([]);
    }
  };

  const handleAddChange = (evt) => {
    const { name, value } = evt.target;

    setFavToAdd((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAdd = () => {
    addFavourites(sanitizeSQLInput(favToAdd.name), sanitizeSQLInput(favToAdd.uid), () => {
      //
    });
    setFavToAdd({ name: "", uid: "" });
    notify("Added new favorite!");
    getAndSetFavorites();
  };

  const handleDelete = async () => {    
    await Promise.all(
      favToDelete.map(
        (id) =>
          new Promise((resolve) => {
            removeFavourite(id, (resp) => {
              // Assuming removeFavourite callback returns something meaningful
              resolve(resp);
            });
          })
      )
    );
    notify("Deleted " + favToDelete.length + " contacts!");
    setFavToDelete([]);

    getAndSetFavorites();
  };

  const handleDeleteSelectChange = (evt) => {
    const checked = evt.target.checked;
    const id = evt.target.value;

    if (checked) {
      // If checkbox is checked, add the ID to the favToDelete array
      setFavToDelete((prevState) => [...prevState, id]);
    } else {
      // If checkbox is unchecked, remove the ID from the favToDelete array
      setFavToDelete((prevState) => prevState.filter((item) => item !== id));
    }
  };

  const hexRegExp = /^0x[0-9a-fA-F]+$/;
  const sqlInjectionPattern = /['";]/; // Example pattern, you might need to adjust it
  const disableForm = (favToAdd.name.length === 0 || favToAdd.uid.length === 0) || sqlInjectionPattern.test(favToAdd.name) || sqlInjectionPattern.test(favToAdd.uid) || !hexRegExp.test(favToAdd.uid);

  return (
    <AnimatedDialog
      isOpen={_promptFavorites}
      onClose={promptFavorites}
      position="items-start mt-20"
      extraClass="max-w-sm mx-auto"
      dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
    >
      <>
        <div className="flex justify-between items-center pr-4">
          <div className="grid grid-cols-[auto_1fr] ml-2">
            <FavoriteIcon fill="currentColor" />
            <h3 className="my-auto font-bold ml-2">
              {mode === "add"
                ? "Add New"
                : mode === "none"
                ? "Favorites"
                : "Delete"}
            </h3>
          </div>
          <svg
            onClick={promptFavorites}
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

        <hr className="h-1 mt-3 border-teal-300 border-1" />
        <div className="px-2 py-2 dark:bg-[#1B1B1B] grid grid-cols-2 gap-1">
          <div className="flex gap-1">
            {mode === "delete" && (
              <div className="flex gap-1">
                <div className="mx-1">
                  <input
                    disabled={favorites.length === 0}
                    type="checkbox"
                    onClick={handleSelectAll}
                  />
                </div>
                <div
                  className={`${favorites.length === 0||favToDelete.length===0 && "opacity-50"}`}
                  onClick={favorites.length > 0 && favToDelete.length>0 ? handleDelete : () => null}
                >
                  <RubbishIcon fill="currentColor" />
                </div>
                <div onClick={() => setMode("none")}>
                  <DoneIcon fill="currentColor" />
                </div>
              </div>
            )}
            {mode === "none" && (
              <div className="flex gap-1">
                <div onClick={() => setMode("add")}>
                  <AddIcon fill="currentColor" />
                </div>
                <div onClick={() => setMode("delete")}>
                  <RemoveIcon fill="currentColor" />
                </div>
              </div>
            )}

            {mode === "add" && (
              <div className="grid grid-cols-[32px_1fr]">
                <div onClick={() => setMode("none")} className="m-auto">
                  <CloseIcon fill="currentColor" />
                </div>
                <input
                  onChange={handleAddChange}
                  value={favToAdd.uid}
                  name="uid"
                  type="text"
                  placeholder="Enter UID"
                  className="px-2 w-full bg-gray-100 dark:bg-black text-sm py-2 focus:outline-teal-300 rounded-lg truncate"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-[1fr_32px]">
            {mode === "add" && (
              <>
                <input
                  onChange={handleAddChange}
                  value={favToAdd.name}
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  className="px-2 w-full bg-gray-100 dark:bg-black text-sm py-2 focus:outline-teal-300 rounded-lg truncate"
                />
                <div onClick={disableForm ? () => null : handleAdd} className={`m-auto rounded-full ${disableForm ? 'opacity-50' : ''}`}>
                  <PlusIcon fill="currentColor" />
                </div>
              </>
            )}
          </div>
        </div>
        {favorites.length === 0 && (
          <p className="text-sm text-center py-3">No favorites yet!</p>
        )}
        <div className={`${mode !== 'add' ? 'h-[calc(100%_-_60px)]' : 'h-[calc(100%_-_80px)]'} overflow-y-scroll`}>
          <ul>
            {favorites
              ? favorites.map((f, index) => (
                  <li
                    key={index+f.BRIDGEUID}
                    onClick={() => {
                      formik.setFieldValue("uid", f.BRIDGEUID);
                      promptFavorites();
                    }}
                    className={`grid ${
                      mode !== "delete"
                        ? "grid-cols-[46px_1fr]"
                        : "grid-cols-[20px_46px_1fr]"
                    } gap-1 mb-3 bg-gray-100 bg-opacity-20 dark:!bg-opacity-50 dark:bg-[#1b1b1b] px-3 hover:bg-white dark:hover:bg-black`}
                  >
                    {mode === "delete" && (
                      <div className="my-auto">
                        <input
                          value={f.ID}
                          onChange={handleDeleteSelectChange}
                          type="checkbox"
                          checked={favToDelete.includes(f.ID)}
                        />
                      </div>
                    )}

                    <div className="my-auto">
                      <Bear extraClass="w-[46px]" input={f.BRIDGEUID} />
                    </div>
                    <div className="pt-2">
                      <input
                        readOnly
                        value={f.NAME}
                        className="bg-transparent cursor-default focus:outline-none w-full truncate font-bold"
                      />                      
                      <input
                        onClick={(e) => e.stopPropagation()}
                        readOnly
                        value={f.BRIDGEUID}
                        className="bg-transparent cursor-default focus:outline-none text-xs w-full truncate font-mono"
                      />
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </>
    </AnimatedDialog>
  );
};

export default Favorites;
