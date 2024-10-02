import React from 'react'

interface OrderHashProps {
  hash: string
}

const OrderHash: React.FC<OrderHashProps> = ({ hash }) => {
  const truncateHash = (hash: string) => {
    if (hash.length <= 12) return hash
    return `${hash.slice(0, 4)}...${hash.slice(-8)}`
  }

  return (
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
      <span className="flex-shrink-0">ID:</span>
      <span 
        className="ml-1 text-gray-800 dark:text-gray-200 font-mono"
        title={hash}
      >
        {truncateHash(hash)}
      </span>
    </p>
  )
}

export default OrderHash;