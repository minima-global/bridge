import React, { useEffect, useState } from 'react'
import { getAllEvents } from "../../../../dapp/js/sql.js"
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

interface Log {
  ID: string
  HASH: string
  EVENT: string
  TOKEN: string
  AMOUNT: string
  TXNHASH: string | null
  EVENTDATE: string
}

const eventTypes = [
  'HTLC_STARTED',
  'CPTXN_SENT',
  'CPTXN_COLLECT',
  'CPTXN_EXPIRED',
  'CPTXN_DEPOSIT',
  'CPTXN_WITHDRAW',
  'CPTXN_APPROVE',
  'CPTXN_SENDETH',
  'DISABLE_ORDERBOOK'
]

const tokens = ['MINIMA', 'ETH:0x67376c3bf3b5a336b14398920cfbc292013718ea', 'ETH:0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF']

const generateMockData = (count: number): Log[] => {
  return Array.from({ length: count }, (_, i) => {
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    return {
      ID: (i + 1).toString(),
      HASH: `0x${Math.random().toString(16).substr(2, 40)}`,
      EVENT: event,
      TOKEN: tokens[Math.floor(Math.random() * tokens.length)],
      AMOUNT: (Math.random() * 1000).toFixed(4),
      TXNHASH: event === 'CPTXN_EXPIRED' ? (Math.random() > 0.7 ? `0x${Math.random().toString(16).substr(2, 64)}` : null) : `0x${Math.random().toString(16).substr(2, 64)}`,
      EVENTDATE: (Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toString()
    }
  })
}

const mockLogs = generateMockData(50)

const EventBadge: React.FC<{ event: string }> = ({ event }) => {
  const colorClass = {
    'HTLC_STARTED': 'bg-blue-100 text-blue-800',
    'CPTXN_SENT': 'bg-green-100 text-green-800',
    'CPTXN_COLLECT': 'bg-purple-100 text-purple-800',
    'CPTXN_EXPIRED': 'bg-red-100 text-red-800',
    'CPTXN_DEPOSIT': 'bg-yellow-100 text-yellow-800',
    'CPTXN_WITHDRAW': 'bg-orange-100 text-orange-800',
    'CPTXN_APPROVE': 'bg-indigo-100 text-indigo-800',
    'CPTXN_SENDETH': 'bg-pink-100 text-pink-800',
    'DISABLE_ORDERBOOK': 'bg-teal-100 text-teal-800'
  }[event] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {event}
    </span>
  )
}

const ScrollableHash: React.FC<{ hash: string | null }> = ({ hash }) => {
  if (!hash) return <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>

  return (
    <div className="max-w-[150px] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
      <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
        {hash}
      </span>
    </div>
  )
}

export default function MockActivitiesPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof Log>('ID')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = logs
    .sort((a, b) => {
      if (a[sortColumn]! < b[sortColumn]!) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn]! > b[sortColumn]!) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    .slice(indexOfFirstEntry, indexOfLastEntry)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleSort = (column: keyof Log) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }


  useEffect(() => {

    getAllEvents(20, 0, (resp) => {

      console.log('all logs', resp);
      setLogs(resp);

    });


  }, []);

  return (
    <div className="px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Activity logs
          </h1>
          
          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 mb-4 bg-yellow-50 dark:bg-yellow-900 p-2 rounded">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Note: Some CPTXN_EXPIRED events may not have a transaction hash if the transaction was not processed.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['ID', 'Hash', 'Event', 'Token', 'Amount', 'Event Message', 'Event Date'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(header.replace(/\s+/g, '').toUpperCase() as keyof Log)}
                    >
                      <div className="flex items-center">
                        {header}
                        {sortColumn === header.replace(/\s+/g, '').toUpperCase() && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentEntries.map((log) => (
                  <tr key={log.ID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{log.ID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ScrollableHash hash={log.HASH} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EventBadge event={log.EVENT} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.TOKEN}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.AMOUNT}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ScrollableHash hash={log.TXNHASH} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(parseInt(log.EVENTDATE)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
              <select
                className="bg-transparent mx-2 border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastEntry >= mockLogs.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}