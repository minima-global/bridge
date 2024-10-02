// import React from 'react'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Info } from "lucide-react"

// const eventExplanations = [
//   {
//     event: "HTLC_STARTED",
//     description: "Initiates a Hash Time Locked Contract (HTLC) swap.",
//     details: "Logs the start of an HTLC swap, including the hash, token, amount, and transaction hash. This event marks the beginning of a cross-chain or cross-token swap process."
//   },
//   {
//     event: "CPTXN_SENT",
//     description: "Indicates that a counterparty transaction has been sent.",
//     details: "Records when a transaction is sent to the counterparty, including the hash, token, amount, and transaction details. This event confirms that your side of the swap has been initiated."
//   },
//   {
//     event: "CPTXN_COLLECT",
//     description: "Logs the collection of funds from an HTLC.",
//     details: "Records when funds are collected from an HTLC, including the hash, token, amount, and transaction hash. This event indicates a successful completion of your side of the swap."
//   },
//   {
//     event: "CPTXN_EXPIRED",
//     description: "Indicates that an HTLC has expired and funds are being refunded.",
//     details: "Logs when an expired HTLC is refunded, including the hash, token, and amount. A transaction hash may or may not be present, depending on whether the refund transaction was processed."
//   },
//   {
//     event: "CPTXN_DEPOSIT",
//     description: "Records a deposit transaction.",
//     details: "Logs deposit transactions with token, amount, and transaction hash. This event is used when funds are added to the system or a specific contract."
//   },
//   {
//     event: "CPTXN_WITHDRAW",
//     description: "Records a withdrawal transaction.",
//     details: "Logs withdrawal transactions with token, amount, and transaction hash. This event is used when funds are removed from the system or a specific contract."
//   },
//   {
//     event: "CPTXN_APPROVE",
//     description: "Logs an approval transaction for token spending.",
//     details: "Records approval transactions with token and transaction hash. This event is typically used for ERC20 tokens to allow another address (often a contract) to spend tokens on behalf of the owner."
//   },
//   {
//     event: "CPTXN_SENDETH",
//     description: "Logs the sending of ETH or ETH-based tokens.",
//     details: "Records transactions sending ETH or ETH-based tokens, including token, amount, and transaction hash. This event is specific to Ethereum-based transactions in the system."
//   }
// ]

// const EventBadge: React.FC<{ event: string }> = ({ event }) => {
//   const colorClass = {
//     'HTLC_STARTED': 'bg-blue-100 text-blue-800',
//     'CPTXN_SENT': 'bg-green-100 text-green-800',
//     'CPTXN_COLLECT': 'bg-purple-100 text-purple-800',
//     'CPTXN_EXPIRED': 'bg-red-100 text-red-800',
//     'CPTXN_DEPOSIT': 'bg-yellow-100 text-yellow-800',
//     'CPTXN_WITHDRAW': 'bg-orange-100 text-orange-800',
//     'CPTXN_APPROVE': 'bg-indigo-100 text-indigo-800',
//     'CPTXN_SENDETH': 'bg-pink-100 text-pink-800',
//   }[event] || 'bg-gray-100 text-gray-800'

//   return (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
//       {event}
//     </span>
//   )
// }

// export default function CounterpartyEventsExplanation() {
//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Counterparty Transaction Events</h1>
//       <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
//         <Info className="w-4 h-4 mr-2" />
//         <span>Explanation of various events in the counterparty transaction system.</span>
//       </div>
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-1/5">Event</TableHead>
//               <TableHead className="w-1/3">Description</TableHead>
//               <TableHead>Details</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {eventExplanations.map((event, index) => (
//               <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
//                 <TableCell className="font-medium">
//                   <EventBadge event={event.event} />
//                 </TableCell>
//                 <TableCell>{event.description}</TableCell>
//                 <TableCell>{event.details}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   )
// }


const Explained = () => {
  return null;
}

export default Explained;