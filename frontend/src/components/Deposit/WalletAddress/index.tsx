import { useState } from "react"
import { Copy, Check } from "lucide-react"
import * as utils from "../../../utils"

interface WalletAddressProps {
  fullAddress?: boolean
  _address: string | null
}

const WalletAddress: React.FC<WalletAddressProps> = ({ fullAddress = false, _address }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (_address) {
      setCopied(true)
      utils.copyToClipboard(_address)
      setTimeout(() => {
        setCopied(false)
      }, 3000)
    }
  }

  const displayAddress = _address
    ? fullAddress
      ? _address
      : `${_address.substring(0, 8)}...${_address.substring(_address.length - 8)}`
    : "N/A"

  return (
    <div className="relative inline-flex items-center max-w-full">
      <input
        readOnly
        value={displayAddress}
        className="p-2 pr-10 text-sm font-medium bg-purple-100 text-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer truncate"
        onClick={handleCopy}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "c") {
            handleCopy()
          }
        }}
      />
      <button
        onClick={handleCopy}
        className="absolute bg-transparent right-2 p-1 rounded-full hover:bg-purple-200 transition-colors duration-200"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-purple-600" />
        )}
      </button>
    </div>
  )
}

export default WalletAddress