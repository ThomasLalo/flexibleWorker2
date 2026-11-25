import { locations, formatTime } from '#lib/shared.svelte.ts';

// share a list of notification that any page can add to
export type Notice = {
    id: number;
    to: string;
    message: string;
    read: boolean;
    time: string;
};

export const notifications: Notice[] = $state([]);

// gives all the notifications their own id
let nextId = 0;

// adds a notification for a worker, manager, or everyone
export function addNotification(to: string, message: string) {
    notifications.push({
        id: nextId++,
        to,
        message, 
        read: false, 
        time: new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}),
    });
}

// removes a notification when dismmis is clicked
export function removeNotification(id: number) {
    const index = notifications.findIndex(notice => notice.id === id);
    if (index != -1) {
        notifications.splice(index, 1);
    }
}
 
// late and absent workers notification for managers
let lateCheck = false;

export function checkLate(){
    if (lateCheck) return;
    lateCheck = true;

    for (const location of locations) { 
        for (const shift of location.shifts) {
            if(shift.worker && shift.late) {
                addNotification("manager", `${shift.worker} was late to their ${shift.month}/${shift.day} shift at ${location.address}`);
            }
            if (shift.worker && shift.absent) {
                addNotification("manager", `${shift.worker} missed their ${shift.month}/${shift.day} shift at ${location.address}`);     
            }
        }
    }
}
   const today = new Date(2026, 11, 10);

   // inform worker about their shift
   let upcomingChecked = false;

   export function checkUpcoming() {
    if (upcomingChecked)
    {
        return;
    }
    upcomingChecked = true;

    const weekAhead = new Date(today);
    weekAhead.setDate(today.getDate() + 7);

    for (const location of locations) {
        for (const shift of location.shifts) {
            const year = shift.month === 1 ? 2027 : 2026;
            const shiftDate = new Date(year, shift.month -1, shift.day);

            if (shift.worker && !shift.canceled && shiftDate > today && shiftDate <= weekAhead)
            {
                addNotification(shift.worker, `Upcoming shift ${shift.month}/${shift.day} at ${formatTime(shift.startTime, shift.startMinute)} at ${location.address}`);
            }
        }
    }
}
