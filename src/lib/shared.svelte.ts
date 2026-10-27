export type Shift = {
  month: number;
  day: number;
  startTime: number;
  endTime: number;
  role: string; // handler or courier
  worker?: string; // these could be Woker objects instead, but honestly it would just be more work
  canceled?: boolean;
  timeChanged?: boolean;
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
export const locations: Location[] = $state([
  {
    address: "123 Address Dr.",
    shifts: [
      { month: 9, day: 1, startTime: 9, endTime: 15, role: "handler" },
      { month: 9, day: 2, startTime: 9, endTime: 15, role: "courier" },
      { month: 9, day: 5, startTime: 8, endTime: 16, role: "handler" },
      { month: 9, day: 9, startTime: 10, endTime: 18, role: "courier" },
      { month: 9, day: 10, startTime: 9, endTime: 17, role: "handler", worker: "Emma Johnson", canceled: true },
      { month: 9, day: 12, startTime: 12, endTime: 18, role: "courier", worker: "Noah Bennett" },

      { month: 9, day: 15, startTime: 7, endTime: 15, role: "handler", worker: "Emma Johnson", timeChanged: true},
      { month: 9, day: 15, startTime: 8, endTime: 16, role: "courier", worker: "Liam Carter" },
      { month: 9, day: 15, startTime: 9, endTime: 17, role: "handler", worker: "Olivia Martinez" },
      { month: 9, day: 15, startTime: 10, endTime: 18, role: "courier", worker: "Noah Bennett" },
      { month: 9, day: 15, startTime: 12, endTime: 20, role: "handler", worker: "Ava Thompson" },
      { month: 9, day: 15, startTime: 14, endTime: 22, role: "courier", worker: "Isabella Patel" },
      { month: 9, day: 17, startTime: 9, endTime: 15, role: "handler" },
      { month: 9, day: 17, startTime: 9, endTime: 15, role: "courier" },
      { month: 9, day: 21, startTime: 9, endTime: 17, role: "handler" },
      { month: 9, day: 27, startTime: 6, endTime: 14, role: "handler", worker: "Sophia Nguyen" },
      { month: 9, day: 27, startTime: 7, endTime: 15, role: "courier", worker: "Ethan Brooks" },
      { month: 9, day: 27, startTime: 8, endTime: 16, role: "handler", worker: "Lucas Foster", canceled: true },
      { month: 9, day: 27, startTime: 11, endTime: 19, role: "courier", worker: "Mason Reed" },
      { month: 9, day: 27, startTime: 12, endTime: 20, role: "handler", worker: "Emma Johnson" },
      { month: 9, day: 27, startTime: 14, endTime: 22, role: "courier", worker: "Liam Carter" },
      { month: 9, day: 28, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 28, startTime: 9, endTime: 17, role: "handler" },
      { month: 9, day: 28, startTime: 12, endTime: 20, role: "courier" },
      { month: 9, day: 29, startTime: 8, endTime: 16, role: "handler" },
      { month: 9, day: 29, startTime: 10, endTime: 18, role: "courier" },
      { month: 9, day: 29, startTime: 12, endTime: 20, role: "handler" },
      { month: 9, day: 30, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 30, startTime: 9, endTime: 17, role: "handler" },
      { month: 9, day: 30, startTime: 11, endTime: 19, role: "handler", worker: "Olivia Martinez", timeChanged: true },
      { month: 9, day: 30, startTime: 12, endTime: 20, role: "courier" },
      { month: 10, day: 1, startTime: 9, endTime: 15, role: "handler" },
      { month: 10, day: 2, startTime: 8, endTime: 16, role: "handler" },
      { month: 10, day: 5, startTime: 9, endTime: 17, role: "courier" },
      { month: 10, day: 9, startTime: 10, endTime: 18, role: "handler" },
      { month: 10, day: 10, startTime: 10, endTime: 16, role: "courier", worker: "Ethan Brooks" },
      { month: 10, day: 11, startTime: 7, endTime: 15, role: "handler", worker: "Olivia Martinez" },
      { month: 10, day: 11, startTime: 8, endTime: 16, role: "courier", worker: "Noah Bennett" },
      { month: 10, day: 11, startTime: 9, endTime: 17, role: "handler", worker: "Ava Thompson" },
      { month: 10, day: 11, startTime: 10, endTime: 18, role: "courier", worker: "Isabella Patel" },
      { month: 10, day: 11, startTime: 12, endTime: 20, role: "courier", worker: "Ethan Brooks" },
      { month: 10, day: 11, startTime: 13, endTime: 21, role: "handler", worker: "Lucas Foster" },
      { month: 10, day: 15, startTime: 7, endTime: 15, role: "handler", worker: "Emma Johnson" },
      { month: 10, day: 15, startTime: 8, endTime: 16, role: "courier" },
      { month: 10, day: 23, startTime: 12, endTime: 20, role: "handler" },
      { month: 10, day: 30, startTime: 9, endTime: 17, role: "courier" },
    ],
  },
  {
    address: "456 Oak St.",
    shifts: [
      { month: 9, day: 4, startTime: 7, endTime: 15, role: "handler" },
      { month: 9, day: 11, startTime: 9, endTime: 17, role: "courier" },
      { month: 9, day: 16, startTime: 8, endTime: 16, role: "courier", worker: "Liam Carter" },
      { month: 9, day: 20, startTime: 7, endTime: 15, role: "courier", worker: "Mason Reed" },
      { month: 9, day: 20, startTime: 8, endTime: 16, role: "handler", worker: "Sophia Nguyen" },
      { month: 9, day: 20, startTime: 9, endTime: 17, role: "courier", worker: "Liam Carter" },
      { month: 9, day: 20, startTime: 10, endTime: 18, role: "handler", worker: "Emma Johnson" },
      { month: 9, day: 20, startTime: 12, endTime: 20, role: "courier", worker: "Isabella Patel" },
      { month: 9, day: 20, startTime: 14, endTime: 22, role: "handler", worker: "Lucas Foster" },
      { month: 9, day: 22, startTime: 10, endTime: 16, role: "courier" },
      { month: 9, day: 24, startTime: 10, endTime: 18, role: "handler" },
      { month: 9, day: 28, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 28, startTime: 10, endTime: 18, role: "handler" },
      { month: 9, day: 28, startTime: 12, endTime: 20, role: "courier" },
      { month: 9, day: 29, startTime: 8, endTime: 16, role: "handler" },
      { month: 9, day: 29, startTime: 9, endTime: 17, role: "courier" },
      { month: 9, day: 29, startTime: 12, endTime: 20, role: "handler" },
      { month: 9, day: 30, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 30, startTime: 10, endTime: 18, role: "handler" },
      { month: 9, day: 30, startTime: 12, endTime: 20, role: "courier" },
      { month: 10, day: 1, startTime: 9, endTime: 17, role: "handler" },
      { month: 10, day: 2, startTime: 8, endTime: 14, role: "handler", worker: "Ava Thompson", canceled: true },
      { month: 10, day: 4, startTime: 6, endTime: 14, role: "handler", worker: "Ava Thompson" },
      { month: 10, day: 4, startTime: 8, endTime: 16, role: "courier", worker: "Noah Bennett" },
      { month: 10, day: 4, startTime: 9, endTime: 17, role: "handler", worker: "Olivia Martinez" },
      { month: 10, day: 4, startTime: 11, endTime: 19, role: "courier", worker: "Ethan Brooks" },
      { month: 10, day: 4, startTime: 13, endTime: 21, role: "handler", worker: "Sophia Nguyen" },
      { month: 10, day: 4, startTime: 14, endTime: 22, role: "courier", worker: "Mason Reed", timeChanged: true },
      { month: 10, day: 6, startTime: 8, endTime: 16, role: "courier" },
      { month: 10, day: 10, startTime: 10, endTime: 18, role: "handler" },
      { month: 10, day: 12, startTime: 12, endTime: 18, role: "handler" },
      { month: 10, day: 16, startTime: 12, endTime: 20, role: "courier" },
      { month: 10, day: 18, startTime: 7, endTime: 15, role: "handler", worker: "Emma Johnson" },
      { month: 10, day: 18, startTime: 8, endTime: 16, role: "courier", worker: "Liam Carter" },
      { month: 10, day: 18, startTime: 9, endTime: 17, role: "courier" },
      { month: 10, day: 18, startTime: 10, endTime: 18, role: "handler", worker: "Lucas Foster" },
      { month: 10, day: 18, startTime: 12, endTime: 20, role: "handler", worker: "Sophia Nguyen" },
      { month: 10, day: 18, startTime: 13, endTime: 21, role: "courier", worker: "Noah Bennett" },
      { month: 10, day: 20, startTime: 9, endTime: 17, role: "courier", worker: "Mason Reed", timeChanged: true },
      { month: 10, day: 24, startTime: 7, endTime: 15, role: "handler" },
      { month: 10, day: 31, startTime: 9, endTime: 17, role: "courier" },
    ],
  },
  {
    address: "789 Maple Ave.",
    shifts: [
      // Unclaimed shifts available to book.
      { month: 9, day: 3, startTime: 8, endTime: 16, role: "handler" },
      { month: 9, day: 14, startTime: 9, endTime: 17, role: "courier" },
      { month: 9, day: 25, startTime: 12, endTime: 20, role: "handler" },
      { month: 9, day: 28, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 28, startTime: 9, endTime: 17, role: "handler" },
      { month: 9, day: 28, startTime: 12, endTime: 20, role: "courier" },
      { month: 9, day: 29, startTime: 8, endTime: 16, role: "handler" },
      { month: 9, day: 29, startTime: 10, endTime: 18, role: "courier" },
      { month: 9, day: 29, startTime: 12, endTime: 20, role: "handler" },
      { month: 9, day: 30, startTime: 8, endTime: 16, role: "courier" },
      { month: 9, day: 30, startTime: 9, endTime: 17, role: "handler" },
      { month: 9, day: 30, startTime: 12, endTime: 20, role: "courier" },
      { month: 10, day: 3, startTime: 8, endTime: 16, role: "handler" },
      { month: 10, day: 7, startTime: 10, endTime: 18, role: "courier" },
      { month: 10, day: 13, startTime: 9, endTime: 17, role: "handler" },
      { month: 10, day: 19, startTime: 12, endTime: 20, role: "courier" },
      { month: 10, day: 25, startTime: 6, endTime: 14, role: "handler" },
      { month: 10, day: 29, startTime: 14, endTime: 22, role: "courier" },
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
