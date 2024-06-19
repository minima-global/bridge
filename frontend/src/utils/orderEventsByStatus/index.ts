import { OrderActivityEvent } from "../../types/Order";

export const orderEventByStatus = (events: OrderActivityEvent[]) => {
    // Group events by HASH
    const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.HASH]) {
            acc[event.HASH] = [];
        }
        acc[event.HASH].push(event);
        return acc;
    }, {});

    // Find the latest event for each HASH
    const latestEvents = Object.values(groupedEvents).map((events: any) => {
        return events.reduce((latest, current) => {
            return current.COUNTERPARTY_EVENTDATE > latest.COUNTERPARTY_EVENTDATE ? current : latest;
        });
    });
    
    // Sort latest events by MYHTLC_EVENTDATE
    latestEvents.sort((a, b) => {
        return Number(b.MYHTLC_EVENTDATE) - Number(a.MYHTLC_EVENTDATE);
    });
    return latestEvents;
}


export default orderEventByStatus;