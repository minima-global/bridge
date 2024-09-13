import { useContext, useEffect, useState } from "react";
import AnimatedDialog from "../UI/AnimatedDialog";
import { appContext } from "../../AppContext";
import FavoriteIcon from "../UI/Icons/FavoriteIcon/index.js";

import { addFavourites, removeFavourite } from "../../../../dapp/js/sql.js";
import Bear from "../UI/Avatars/Bear/index.js";
import AddIcon from "../UI/Icons/AddIcon/index.js";
import RemoveIcon from "../UI/Icons/RemoveIcon/index.js";
import RubbishIcon from "../UI/Icons/RubbishIcon/index.js";
import DoneIcon from "../UI/Icons/DoneIcon/index.js";
import CloseIcon from "../UI/Icons/CloseIcon/index.js";
import PlusIcon from "../UI/Icons/PlusIcon/index.js";

import sanitizeSQLInput from "../../libs/sanitizeSQL.js";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Favorites = () => {
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const form = searchParams.get("form");
  const action = searchParams.get("action");

  const location = useLocation();
  const navigate = useNavigate();

  const { notify, getAndSetFavorites, _favorites, loaded } =
    useContext(appContext);
  const [favToDelete, setFavToDelete] = useState<string[]>([]);
  const [favToAdd, setFavToAdd] = useState({ name: "", uid: uid || "" });

  useEffect(() => {
    if (uid) {
      setFavToAdd({ name: "", uid: uid });
    }
  }, [uid, form]);

  useEffect(() => {
    if (loaded && loaded.current) {
      getAndSetFavorites();
    }
  }, []);

  const handleSelectAll = (evt) => {
    const checked = evt.target.checked;

    if (checked) {
      setFavToDelete(_favorites.map((fav) => fav.ID));
    } else {
      setFavToDelete([]);
    }
  };

  const handleAddChange = (evt) => {
    const { name, value } = evt.target;

    setFavToAdd((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAdd = async () => {
    if (_favorites.find((t) => t.BRIDGEUID === favToAdd.uid)) {
      notify("You have this contact already.");
      return;
    }

    addFavourites(
      sanitizeSQLInput(favToAdd.name),
      sanitizeSQLInput(favToAdd.uid),
      () => {
        //
      },
    );
    setFavToAdd({ name: "", uid: "" });
    notify("Added new favorite.");
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
          }),
      ),
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
  const disableForm =
    favToAdd.name.length === 0 ||
    favToAdd.uid.length === 0 ||
    sqlInjectionPattern.test(favToAdd.name) ||
    sqlInjectionPattern.test(favToAdd.uid) ||
    !hexRegExp.test(favToAdd.uid);

  const actionDelete = action && action === "delete";
  const actionAdd = action && action === "add";

  return (
    <AnimatedDialog
      up={50}
      display={location.pathname.includes("/fav")}
      dismiss={() => null}
    >
      <>
        <div className="flex justify-between items-center pr-4">
          <div className="grid grid-cols-[auto_1fr] ml-2">
            <FavoriteIcon fill="currentColor" />
            <h3 className="my-auto font-bold ml-2">
              {!action && "Favorites"}
              {action &&
                action.substring(0, 1).toUpperCase() +
                  action.substring(1, action.length).toLowerCase()}
            </h3>
          </div>
          <span onClick={() => navigate("/")}>
            <CloseIcon fill="currentColor" />
          </span>
        </div>

        <hr className="h-1 mt-3 border-teal-300 border-1" />

        <div className="flex gap-1 px-2 py-2 dark:bg-neutral-950">
          {actionDelete && (
            <div className="flex gap-1">
              <div className="mx-1">
                <input
                  disabled={_favorites.length === 0}
                  type="checkbox"
                  onClick={handleSelectAll}
                />
              </div>
              <div
                className={`${
                  _favorites.length === 0 ||
                  (favToDelete.length === 0 && "opacity-50")
                }`}
                onClick={
                  _favorites.length > 0 && favToDelete.length > 0
                    ? handleDelete
                    : () => null
                }
              >
                <RubbishIcon fill="currentColor" />
              </div>
              <div
                onClick={() => {
                  searchParams.delete("action");
                  navigate(`/fav?${searchParams.toString()}`);
                }}
              >
                <DoneIcon fill="currentColor" />
              </div>
            </div>
          )}
          {!action && (
            <div className="flex gap-1">
              <div
                onClick={() => {
                  searchParams.set("action", "add");
                  navigate(`/fav?${searchParams.toString()}`);
                }}
              >
                <AddIcon fill="currentColor" />
              </div>
              <div
                onClick={() => {
                  searchParams.set("action", "delete");
                  navigate(`/fav?${searchParams.toString()}`);
                }}
              >
                <RemoveIcon fill="currentColor" />
              </div>
            </div>
          )}

          {actionAdd && (
            <div className="flex gap-1 w-full">
              <div
                onClick={() => {
                  searchParams.delete("action");
                  navigate(`/fav?${searchParams.toString()}`);
                }}
                className="my-auto"
              >
                <CloseIcon fill="currentColor" />
              </div>
              <div className="flex-grow flex gap-1 mx-2">
                <input
                  onChange={handleAddChange}
                  value={favToAdd.uid}
                  name="uid"
                  type="text"
                  placeholder="Enter UID"
                  className="flex-grow focus:outline-none dark:text-neutral-100 dark:bg-black dark:border dark:border-neutral-800  px-2 w-full bg-gray-100 text-sm py-2 rounded-lg truncate dark:placeholder:text-neutral-600 text-center"
                />

                <input
                  onChange={handleAddChange}
                  value={favToAdd.name}
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  className="flex-grow focus:outline-none dark:text-neutral-100 dark:bg-black dark:border dark:border-neutral-800  px-2 w-full bg-gray-100 text-sm py-2 rounded-lg truncate dark:placeholder:text-neutral-600 text-center"
                />
              </div>

              {!disableForm && (
                <div
                  onClick={disableForm ? () => null : handleAdd}
                  className={`text-[#1B1B1B] dark:text-neutral-500 m-auto rounded-full`}
                >
                  <PlusIcon fill="currentColor" />
                </div>
              )}
            </div>
          )}
        </div>
        {_favorites.length === 0 && (
          <p className="text-sm text-center py-3 dark:text-neutral-500">
            No favorites added
          </p>
        )}
        <div
          className={`${
            !actionAdd ? "h-[calc(100%_-_60px)]" : "h-[calc(100%_-_80px)]"
          } overflow-y-auto`}
        >
          <ul>
            {_favorites
              ? _favorites.map((f, index) => (
                  <li
                    onClick={() => {
                      if (form) {
                        searchParams.set("contact", f.BRIDGEUID);
                        navigate(`/?${searchParams.toString()}`);
                      }
                    }}
                    key={index + f.BRIDGEUID}
                    className={`grid ${
                      !actionDelete
                        ? "grid-cols-[46px_1fr]"
                        : "grid-cols-[20px_46px_1fr]"
                    } gap-1 mb-3 bg-gray-100 bg-opacity-20 dark:!bg-opacity-50 dark:bg-[#1b1b1b] px-3 hover:bg-white dark:hover:bg-black`}
                  >
                    {actionDelete && (
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
                    <div className="pt-2 pl-2">
                      <input
                        readOnly
                        value={f.NAME}
                        className="bg-transparent cursor-default focus:outline-none w-full truncate font-bold"
                      />
                      <input
                        onClick={(e) => e.stopPropagation()}
                        readOnly
                        value={f.BRIDGEUID}
                        className="bg-transparent cursor-default focus:outline-none text-xs w-full truncate"
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
