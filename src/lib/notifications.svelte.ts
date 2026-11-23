import { locations } from '#lib/shared.svelte.ts';

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
 
// late workers notification for managers
let lateCheck = false;

export function checkLate(){
    if (lateCheck) return;
    lateCheck = true;

    for (const location of locations) { 
        for (const shift of location.shifts) {
            if(shift.worker && shift.late) {
                addNotification("manager", `${shift.worker} was late to their ${shift.month}/${shift.day} shift at ${location.address}`);
            }
        }
    }
}

let todayChecked = false;

export function checkToday() {
    if (todayChecked) return; 
    todayChecked = true;

    const today = new Date()
    const month = today.getMonth() + 1;
    const day = today.getDate();

    for (const location of locations){
        for (const shift of location.shifts) {
            if (shift.worker && !shift.canceled && shift.month === month && shift.day === day){
                addNotification(shift.worker, `You have a shift today at $[shift.startTime]:00 at ${location.address}`);
            }
        }
    }

}