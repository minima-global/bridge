import { useContext, useEffect, useRef, useState } from "react"
import OrderItem from "./OrderItem/index.js"
import { appContext } from "../../../../../AppContext.js"
import { Activity, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

const sortEventsByEvent = (data) => {
  const eventDateEntries = Object.entries(data).map(([key, eventsArray]) => {
    const firstEventDate = (eventsArray as any)[0]?.EVENTDATE || 0
    return { key, firstEventDate }
  })

  eventDateEntries.sort((a, b) => b.firstEventDate - a.firstEventDate)

  const sortedData = {}
  eventDateEntries.forEach(({ key }) => {
    sortedData[key] = data[key]
  })

  Object.keys(sortedData).forEach((key) => {
    sortedData[key] = sortedData[key].sort((a, b) => b.EVENTDATE - a.EVENTDATE)
  })

  return sortedData
}

const OrderHistory = ({ full = false }) => {
  const {
    orders,
    getAllOrders,
    offsetOrders,
    promptLogs,
    setSwitchLogView,
    _promptLogs,
  } = useContext(appContext)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const intervalId = useRef<number | null>(null)

  const startPolling = () => {
    setIsLoading(true)
    getAllOrders(10 + 1, offsetOrders)
    intervalId.current = window.setInterval(
      () => getAllOrders(10 + 1, offsetOrders),
      30000,
    )
    setIsLoading(false)
  }

  const stopPolling = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
      intervalId.current = null
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    startPolling()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopPolling()
    }
  }, [offsetOrders])

  const handleViewOrders = () => {
    promptLogs()
    setSwitchLogView("orders")
  }

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const hasOrders = orders !== null && Object.keys(orders).length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-teal-500" />
          Order History
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={startPolling}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {!full && (
            <button
              onClick={toggleExpand}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label={isExpanded ? "Collapse order history" : "Expand order history"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
      <div className={`${!full && !isExpanded ? 'max-h-[300px]' : ''} overflow-y-auto transition-all duration-300 ease-in-out`}>
        {!hasOrders ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No orders available</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.keys(sortEventsByEvent(orders)).map((hash) => (
              <OrderItem key={hash} order={{ ...orders[hash] }} />
            ))}
          </ul>
        )}
      </div>
      {!_promptLogs && hasOrders && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewOrders}
            className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Activity className="w-5 h-5 mr-2" />
            View Full Order History
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderHistory