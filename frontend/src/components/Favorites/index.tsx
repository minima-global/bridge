import { useContext, useEffect, useState } from "react";
import AnimatedDialog from "../UI/AnimatedDialog";
import { appContext } from "../../AppContext";
import FavoriteIcon from "../UI/FavoriteIcon";

import {
  addFavourites,
  removeFavourite,
  getFavourites,
  removeAllFavourites,
} from "../../../../dapp/js/sql.js";
import { Favorite } from "../../types/Favorite.js";
import Bear from "../UI/Avatars/Bear/index.js";
import AddIcon from "../UI/AddIcon/index.js";
import RemoveIcon from "../UI/RemoveIcon/index.js";
import RubbishIcon from "../UI/RubbishIcon/index.js";
import DoneIcon from "../UI/DoneIcon/index.js";

const Favorites = () => {
  const { _promptFavorites, promptFavorites, notify } = useContext(appContext);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [mode, setMode] = useState<"none" | "delete" | "add">("none");

  const [favToDelete, setFavToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (_promptFavorites) {
      getFavourites((favs) => {
        console.log("MY FAVS!", favs);
        setFavorites(favs.rows);
      });

      //   addFavourites("Jimmy", "0xC546BAE990FABA6893A73A8ED50F3FB1368DC1AB8E9E5C26A94EBDFB2CE4C724", (resp) => {
      //       console.log('ADDED NEW FAV!', resp);
      //   });
    }
  }, [_promptFavorites]);

  const handleSelectAll = (evt) => {
    const checked = evt.target.checked;

    if (checked) {
      setFavToDelete(favorites.map((fav) => fav.ID));
    } else {
      setFavToDelete([]);
    }

  }

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

    getFavourites((favs) => {
      setFavorites(favs.rows);
    });
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
            <h3 className="my-auto font-bold ml-2">Favorites</h3>
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
        <div className="px-2 py-2 dark:bg-[#1B1B1B] grid grid-cols-2">
          <div className="flex gap-1">
            {mode === "delete" && (
              <div className="flex gap-1">
                <div className="mx-1">
                  <input disabled={favorites.length === 0} type="checkbox" onClick={handleSelectAll} />
                </div>
                <div className={`${favorites.length === 0 && "opacity-50"}`} onClick={favorites.length > 0 ? handleDelete : () => null}>
                  <RubbishIcon fill="currentColor" />
                </div>
                <div onClick={() => setMode("none")}>
                  <DoneIcon fill="currentColor" />
                </div>
              </div>
            )}
            {mode !== "delete" && (
              <div className="flex gap-1">
                <AddIcon fill="currentColor" />
                <div onClick={() => setMode("delete")}>
                  <RemoveIcon fill="currentColor" />
                </div>
              </div>
            )}
          </div>
          <div />
        </div>
        {favorites.length === 0 && <p className="text-sm text-center py-3">No favorites yet!</p>}
        <div className="h-[calc(100%_-_60px)] overflow-y-scroll">
          <ul>
            {favorites
              ? favorites.map((f) => (
                  <li
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
                      <h6 className="text-sm font-bold">{f.NAME}</h6>
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
