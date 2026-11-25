export function formatTime(hour: number, minute: number): string {
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${displayMinute} ${period}`;
}

// Time inputs use 24-hour HH:mm values, unlike the display labels.
export function formatTimeInput(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

// Return minutes since midnight, or null for an empty/invalid time input.
export function parseTime(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  return timeToMinutes(hour, minute);
}

export type Shift = {
  month: number;
  day: number;
  startTime: number;
  startMinute: number; // integer from 0 to 59
  endTime: number;
  endMinute: number; // integer from 0 to 59
  role: string; // handler or courier
  worker?: string; // these could be Woker objects instead, but honestly it would just be more work
  canceled?: boolean;
  timeChanged?: boolean;
  late?: boolean;
  absent?: boolean;
};

export type Location = {
  address: string;
  shifts: Shift[];
};

export type Worker = {
  name: string;
  punctuality: number;
  attendance: number;
  role: string; // handler or courier
  email: string;
  phone: string;
  certifications: string[];
}

// the whole array is a state variable
// so whenever any values get changed the whole page would be re-rendered
// the array MUST be mutated and not reassigned. use locations.push() or locations.splice()
// Half of the dummy shifts are in November or December 1-9;
// half are in December 11-31 or the following January.
export const locations: Location[] = $state([
  {
    address: "123 Address Dr.",
    shifts: [
      { month: 11, day: 21, startTime: 9, startMinute: 0, endTime: 15, endMinute: 0, role: "handler" },
      { month: 11, day: 21, startTime: 9, startMinute: 30, endTime: 15, endMinute: 0, role: "courier" },
      { month: 11, day: 21, startTime: 8, startMinute: 0, endTime: 16, endMinute: 30, role: "handler" },
      { month: 11, day: 22, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "courier" },
      { month: 11, day: 22, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "handler", worker: "Emma Johnson", canceled: true },
      { month: 11, day: 22, startTime: 12, startMinute: 0, endTime: 18, endMinute: 0, role: "courier", worker: "Noah Bennett", absent: true },
      { month: 11, day: 23, startTime: 7, startMinute: 0, endTime: 15, endMinute: 30, role: "handler", worker: "Emma Johnson", timeChanged: true},
      { month: 11, day: 23, startTime: 8, startMinute: 30, endTime: 16, endMinute: 0, role: "courier", worker: "Liam Carter", absent: true },
      { month: 12, day: 4, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "handler", worker: "Olivia Martinez", late: true},
      { month: 12, day: 4, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "courier", worker: "Noah Bennett" },
      { month: 12, day: 4, startTime: 12, startMinute: 30, endTime: 20, endMinute: 30, role: "handler", worker: "Ava Thompson" },
      { month: 12, day: 5, startTime: 14, startMinute: 0, endTime: 22, endMinute: 0, role: "courier", worker: "Isabella Patel" },
      { month: 12, day: 5, startTime: 9, startMinute: 0, endTime: 15, endMinute: 0, role: "handler" },
      { month: 12, day: 5, startTime: 9, startMinute: 30, endTime: 15, endMinute: 0, role: "courier" },
      { month: 12, day: 6, startTime: 9, startMinute: 0, endTime: 17, endMinute: 30, role: "handler" },
      { month: 12, day: 6, startTime: 6, startMinute: 0, endTime: 14, endMinute: 0, role: "handler", worker: "Sophia Nguyen", absent: true },
      { month: 12, day: 7, startTime: 7, startMinute: 30, endTime: 15, endMinute: 0, role: "courier", worker: "Ethan Brooks", late: true},
      { month: 12, day: 7, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "handler", worker: "Lucas Foster", canceled: true },
      { month: 12, day: 7, startTime: 11, startMinute: 0, endTime: 19, endMinute: 30, role: "courier", worker: "Mason Reed" },
      { month: 12, day: 8, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "handler", worker: "Emma Johnson" },
      { month: 12, day: 8, startTime: 14, startMinute: 0, endTime: 22, endMinute: 0, role: "courier", worker: "Liam Carter" },
      { month: 12, day: 8, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 9, startTime: 9, startMinute: 30, endTime: 17, endMinute: 30, role: "handler" },
      { month: 12, day: 9, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 11, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "handler" },
      { month: 12, day: 11, startTime: 10, startMinute: 30, endTime: 18, endMinute: 0, role: "courier" },
      { month: 12, day: 12, startTime: 12, startMinute: 0, endTime: 20, endMinute: 30, role: "handler" },
      { month: 12, day: 13, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 14, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "handler" },
      { month: 12, day: 15, startTime: 11, startMinute: 0, endTime: 19, endMinute: 0, role: "handler", worker: "Olivia Martinez", timeChanged: true },
      { month: 12, day: 16, startTime: 12, startMinute: 0, endTime: 20, endMinute: 30, role: "courier" },
      { month: 12, day: 17, startTime: 9, startMinute: 30, endTime: 15, endMinute: 0, role: "handler" },
      { month: 12, day: 18, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "handler" },
      { month: 12, day: 18, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "courier" },
      { month: 12, day: 19, startTime: 10, startMinute: 30, endTime: 18, endMinute: 30, role: "handler" },
      { month: 12, day: 20, startTime: 10, startMinute: 0, endTime: 16, endMinute: 0, role: "courier", worker: "Ethan Brooks" },
      { month: 12, day: 21, startTime: 7, startMinute: 0, endTime: 15, endMinute: 0, role: "handler", worker: "Olivia Martinez" },
      { month: 12, day: 22, startTime: 8, startMinute: 30, endTime: 16, endMinute: 0, role: "courier", worker: "Noah Bennett" },
      { month: 12, day: 23, startTime: 9, startMinute: 0, endTime: 17, endMinute: 30, role: "handler", worker: "Ava Thompson" },
      { month: 12, day: 24, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "courier", worker: "Isabella Patel" },
      { month: 1, day: 1, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "courier", worker: "Ethan Brooks" },
      { month: 1, day: 1, startTime: 13, startMinute: 0, endTime: 21, endMinute: 0, role: "handler", worker: "Lucas Foster" },
      { month: 1, day: 2, startTime: 7, startMinute: 0, endTime: 15, endMinute: 30, role: "handler", worker: "Emma Johnson" },
      { month: 1, day: 3, startTime: 8, startMinute: 30, endTime: 16, endMinute: 0, role: "courier" },
      { month: 1, day: 4, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "handler" },
      { month: 1, day: 5, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "courier" },
      { month: 1, day: 6, startTime: 9, startMinute: 30, endTime: 15, endMinute: 30, role: "handler", worker: "Emma Johnson"},
      { month: 1, day: 7, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "handler", worker: "Emma Johnson"},
    ],
  },
  {
    address: "456 Oak St.",
    shifts: [
      { month: 11, day: 21, startTime: 7, startMinute: 0, endTime: 15, endMinute: 0, role: "handler" },
      { month: 11, day: 21, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "courier" },
      { month: 11, day: 21, startTime: 8, startMinute: 0, endTime: 16, endMinute: 30, role: "courier", worker: "Liam Carter", absent: true },
      { month: 11, day: 22, startTime: 7, startMinute: 0, endTime: 15, endMinute: 0, role: "courier", worker: "Mason Reed", late: true},
      { month: 11, day: 22, startTime: 8, startMinute: 30, endTime: 16, endMinute: 0, role: "handler", worker: "Sophia Nguyen", absent: true },
      { month: 11, day: 23, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "courier", worker: "Liam Carter", late: true },
      { month: 11, day: 23, startTime: 10, startMinute: 0, endTime: 18, endMinute: 30, role: "handler", worker: "Emma Johnson", absent: true },
      { month: 12, day: 4, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "courier", worker: "Isabella Patel" },
      { month: 12, day: 4, startTime: 14, startMinute: 0, endTime: 22, endMinute: 0, role: "handler", worker: "Lucas Foster" },
      { month: 12, day: 4, startTime: 10, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 5, startTime: 10, startMinute: 30, endTime: 18, endMinute: 30, role: "handler" },
      { month: 12, day: 5, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 6, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "handler" },
      { month: 12, day: 6, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 7, startTime: 8, startMinute: 0, endTime: 16, endMinute: 30, role: "handler" },
      { month: 12, day: 7, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "courier" },
      { month: 12, day: 7, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "handler" },
      { month: 12, day: 8, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 8, startTime: 10, startMinute: 0, endTime: 18, endMinute: 30, role: "handler" },
      { month: 12, day: 9, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 9, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "handler" },
      { month: 12, day: 11, startTime: 8, startMinute: 0, endTime: 14, endMinute: 0, role: "handler", worker: "Ava Thompson", canceled: true },
      { month: 12, day: 12, startTime: 6, startMinute: 30, endTime: 14, endMinute: 30, role: "handler", worker: "Ava Thompson" },
      { month: 12, day: 13, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier", worker: "Noah Bennett" },
      { month: 12, day: 14, startTime: 9, startMinute: 0, endTime: 17, endMinute: 0, role: "handler", worker: "Olivia Martinez" },
      { month: 12, day: 15, startTime: 11, startMinute: 30, endTime: 19, endMinute: 0, role: "courier", worker: "Ethan Brooks" },
      { month: 12, day: 16, startTime: 13, startMinute: 0, endTime: 21, endMinute: 30, role: "handler", worker: "Sophia Nguyen" },
      { month: 12, day: 17, startTime: 14, startMinute: 0, endTime: 22, endMinute: 0, role: "courier", worker: "Mason Reed", timeChanged: true },
      { month: 12, day: 18, startTime: 8, startMinute: 30, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 19, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "handler" },
      { month: 12, day: 20, startTime: 12, startMinute: 0, endTime: 18, endMinute: 30, role: "handler" },
      { month: 12, day: 21, startTime: 12, startMinute: 30, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 22, startTime: 7, startMinute: 0, endTime: 15, endMinute: 0, role: "handler", worker: "Emma Johnson" },
      { month: 12, day: 23, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier", worker: "Liam Carter" },
      { month: 12, day: 24, startTime: 9, startMinute: 30, endTime: 17, endMinute: 30, role: "courier" },
      { month: 1, day: 1, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "handler", worker: "Lucas Foster" },
      { month: 1, day: 2, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "handler", worker: "Sophia Nguyen" },
      { month: 1, day: 3, startTime: 13, startMinute: 30, endTime: 21, endMinute: 0, role: "courier", worker: "Noah Bennett" },
      { month: 1, day: 4, startTime: 9, startMinute: 0, endTime: 17, endMinute: 30, role: "courier", worker: "Mason Reed", timeChanged: true },
      { month: 1, day: 5, startTime: 7, startMinute: 0, endTime: 15, endMinute: 0, role: "handler" },
      { month: 1, day: 6, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "courier" },
      { month: 1, day: 7, startTime: 10, startMinute: 0, endTime: 18, endMinute: 0, role: "handler" },
    ],
  },
  {
    address: "789 Maple Ave.",
    shifts: [
      // Unclaimed shifts available to book.
      { month: 11, day: 21, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "handler" },
      { month: 11, day: 22, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "courier" },
      { month: 11, day: 23, startTime: 12, startMinute: 0, endTime: 20, endMinute: 30, role: "handler" },
      { month: 12, day: 4, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 5, startTime: 9, startMinute: 30, endTime: 17, endMinute: 0, role: "handler" },
      { month: 12, day: 6, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 7, startTime: 8, startMinute: 0, endTime: 16, endMinute: 30, role: "handler" },
      { month: 12, day: 8, startTime: 10, startMinute: 30, endTime: 18, endMinute: 0, role: "courier" },
      { month: 12, day: 9, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "handler" },
      { month: 12, day: 11, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "courier" },
      { month: 12, day: 13, startTime: 9, startMinute: 30, endTime: 17, endMinute: 30, role: "handler" },
      { month: 12, day: 15, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "courier" },
      { month: 12, day: 18, startTime: 8, startMinute: 0, endTime: 16, endMinute: 0, role: "handler" },
      { month: 12, day: 20, startTime: 10, startMinute: 30, endTime: 18, endMinute: 0, role: "courier" },
      { month: 12, day: 22, startTime: 9, startMinute: 0, endTime: 17, endMinute: 30, role: "handler" },
      { month: 1, day: 1, startTime: 12, startMinute: 0, endTime: 20, endMinute: 0, role: "courier" },
      { month: 1, day: 3, startTime: 6, startMinute: 30, endTime: 14, endMinute: 0, role: "handler" },
      { month: 1, day: 5, startTime: 14, startMinute: 0, endTime: 22, endMinute: 0, role: "courier" },
    ],
  },
])


export const roster: Worker[] = $state([
  { name: "Emma Johnson", punctuality: 92, attendance: 97, role: "handler",
    email: "emma.johnson@example.com", phone: "(555) 201-4410", certifications: ["Forklift", "First Aid"] },
  { name: "Liam Carter", punctuality: 78, attendance: 85, role: "courier",
    email: "liam.carter@example.com", phone: "(555) 318-0092", certifications: ["CDL"] },
  { name: "Olivia Martinez", punctuality: 88, attendance: 94, role: "handler",
    email: "olivia.martinez@example.com", phone: "(555) 774-3381", certifications: ["Forklift", "Hazmat"] },
  { name: "Noah Bennett", punctuality: 65, attendance: 72, role: "courier",
    email: "noah.bennett@example.com", phone: "(555) 640-1127", certifications: ["CDL"] },
  { name: "Ava Thompson", punctuality: 97, attendance: 99, role: "handler",
    email: "ava.thompson@example.com", phone: "(555) 902-5563", certifications: ["Forklift", "Hazmat", "First Aid"] },
  { name: "Ethan Brooks", punctuality: 81, attendance: 76, role: "courier",
    email: "ethan.brooks@example.com", phone: "(555) 415-2238", certifications: ["CDL", "Hazmat"] },
  { name: "Sophia Nguyen", punctuality: 90, attendance: 91, role: "handler",
    email: "sophia.nguyen@example.com", phone: "(555) 287-6604", certifications: ["Forklift"] },
  { name: "Mason Reed", punctuality: 59, attendance: 68, role: "courier",
    email: "mason.reed@example.com", phone: "(555) 539-7712", certifications: ["CDL"] },
  { name: "Isabella Patel", punctuality: 84, attendance: 89, role: "courier",
    email: "isabella.patel@example.com", phone: "(555) 863-0459", certifications: ["CDL", "First Aid"] },
  { name: "Lucas Foster", punctuality: 73, attendance: 80, role: "handler",
    email: "lucas.foster@example.com", phone: "(555) 126-9381", certifications: ["Forklift"] },
]);

export type Message = {
  from: "manager" | "worker";
  text: string;
  month: number;
  day: number;
  time: string;
};

// messages between the manager and a worker, the key is the worker's name
// same as above, push to these arrays instead of reassigning them
export const conversations: Record<string, Message[]> = $state({
  "Ava Thompson": [
    { from: "manager", month: 11, day: 20, time: "3:10 PM", text: "Hey Ava, just a heads up your 12/11 shift at 456 Oak St. got canceled. We don't need as many people that morning." },
    { from: "worker", month: 11, day: 20, time: "3:24 PM", text: "Ok thanks for letting me know. Is there anything else open around then I could pick up?" },
    { from: "manager", month: 11, day: 20, time: "3:31 PM", text: "There's an early handler shift on 12/12 at Oak St, 6:30am to 2:30pm. Want it?" },
    { from: "worker", month: 11, day: 20, time: "3:35 PM", text: "Yes I'll take it" },
    { from: "manager", month: 11, day: 20, time: "3:40 PM", text: "Done, you're on the schedule. Thanks!" },
    { from: "worker", month: 11, day: 21, time: "6:48 PM", text: "Is my shift on 12/4 at 123 Address Dr. still 12:30 to 8:30?" },
    { from: "manager", month: 11, day: 21, time: "7:02 PM", text: "Yep no changes, see you then" },
    { from: "worker", month: 11, day: 22, time: "10:15 AM", text: "Also could I leave a little early on 12/23? It's right before the holidays" },
    { from: "manager", month: 11, day: 22, time: "10:40 AM", text: "Should be fine, just remind me the week before" },
  ],
});
