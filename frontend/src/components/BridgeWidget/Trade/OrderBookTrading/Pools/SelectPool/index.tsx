import { ChangeEventHandler } from "react"
import { ArrowRightLeft, ChevronRight } from "lucide-react"

interface IProps {
  selectedOption: "wminima" | "usdt"
  handleOptionChange: ChangeEventHandler<HTMLInputElement>
}

const SelectPool = ({ selectedOption, handleOptionChange }: IProps) => {
  return (
    <div className="w-full">
      <fieldset>
        <legend className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <ArrowRightLeft className="w-5 h-5 mr-2 text-violet-500" />
          Choose a trading pool
        </legend>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <PoolOption
            value="wminima"
            label="wMinima"
            description="Trade native Minima for wrapped Minima"
            icon="./assets/wtoken.svg"
            isSelected={selectedOption === "wminima"}
            onChange={handleOptionChange}
          />
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <PoolOption
            value="usdt"
            label="USDT"
            description="Trade native Minima for USDT"
            icon="./assets/tether.svg"
            isSelected={selectedOption === "usdt"}
            onChange={handleOptionChange}
          />
        </div>
      </fieldset>
    </div>
  )
}

interface PoolOptionProps {
  value: string
  label: string
  description: string
  icon: string
  isSelected: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}

const PoolOption = ({ value, label, description, icon, isSelected, onChange }: PoolOptionProps) => (
  <label
    className={`
      flex items-center justify-between p-4 cursor-pointer
      transition-all duration-200 ease-in-out
      ${isSelected 
        ? "bg-violet-50 dark:bg-violet-900" 
        : "hover:bg-gray-50 dark:hover:bg-gray-700"
      }
    `}
  >
    <div className="flex items-center">
      <img
        src={icon}
        alt={`${label} icon`}
        className="w-10 h-10 rounded-full mr-4"
      />
      <div>
        <div className={`text-lg font-medium ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-gray-800 dark:text-white"}`}>
          {label}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </div>
    </div>
    <div className="flex items-center">
      <input
        type="radio"
        name="option"
        value={value}
        checked={isSelected}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-violet-500 bg-violet-500" : "border-gray-300 dark:border-gray-600"} flex items-center justify-center`}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
      </div>
    </div>
  </label>
)

export default SelectPool