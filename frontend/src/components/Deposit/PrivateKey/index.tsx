import { useContext, useState } from "react"
import { Copy, Check } from "lucide-react"
import * as utils from "../../../utils"
import { appContext } from "../../../AppContext"

interface PrivateKeyProps {
  fullAddress?: boolean
}

const PrivateKey: React.FC<PrivateKeyProps> = () => {
  const { _generatedKey } = useContext(appContext)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (_generatedKey) {
      setCopied(true)
      utils.copyToClipboard(_generatedKey)
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <textarea
        rows={3}
        readOnly
        value={_generatedKey || "N/A"}
        className="w-full p-3 pr-10 text-sm font-medium bg-purple-100 text-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer resize-none"
        onClick={handleCopy}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "c") {
            handleCopy()
          }
        }}
      />
      <button
        onClick={handleCopy}
        className="absolute bg-transparent top-6 right-2 p-1 rounded-full hover:bg-purple-200 transition-colors duration-200"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-purple-600" />
        )}
      </button>      
    </div>
  )
}

export default PrivateKey