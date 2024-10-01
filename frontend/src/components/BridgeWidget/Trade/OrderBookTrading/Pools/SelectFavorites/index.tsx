import { FormikContextType, FormikValues, useFormikContext } from "formik"
import { useEffect } from "react"
import { Star } from "lucide-react"

const SelectFavorites = () => {
  const formik: FormikContextType<FormikValues> = useFormikContext()
  const { values, setFieldValue } = formik
  const { favorites } = values

  const toggleFavorite = () => {
    const newValue = !favorites;
    (window as any).MDS.keypair.set("_orderfavs", newValue, () => null)
    setFieldValue("favorites", newValue)
  }

  useEffect(() => {
    (window as any).MDS.keypair.get("_orderfavs", (resp) => {
      const status = resp.value
      setFieldValue("favorites", status === "true")
    });
  }, [setFieldValue])

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
        favorites
          ? "bg-violet-100 text-violet-600 hover:bg-violet-200"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      }`}
      aria-pressed={favorites}
      aria-label={favorites ? "Disable favorites" : "Enable favorites"}
    >
      <p className="text-sm px-2">Trade with favorites only</p>
      <Star
        className={`w-5 h-5 ${favorites ? "fill-current" : "stroke-current"}`}
      />
    </button>
  )
}

export default SelectFavorites