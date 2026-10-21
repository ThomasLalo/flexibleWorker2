  type Shift = {
    date: string;
    time: string;
    canceled?: boolean;
    timeChanged?: boolean;
  };

  type Location = {
    address: string;
    shifts: Shift[];
  };

  // the whole array is a state variable
  // so whenever any values get changed the whole page would be re-rendered
  // the array MUST be mutated and not reassigned. use locations.push() or locations.splice()
  export let locations: Location[] = $state([
    {
      address: "123 Address Dr.",
      shifts: [
        { date: "9/28", time: "9 AM - 5 PM" },
        { date: "9/29", time: "8 AM - 4 PM", canceled: true },
        { date: "9/30", time: "11 AM - 7 PM", timeChanged: true },
        { date: "10/1", time: "9 AM - 3 PM" },
      ],
    },
    {
      address: "456 Oak St.",
      shifts: [
        { date: "10/2", time: "8 AM - 2 PM" },
        { date: "10/3", time: "10 AM - 4 PM" },
        { date: "10/4", time: "12 PM - 6 PM" },
        { date: "10/5", time: "9 AM - 5 PM" },
      ],
    },
    { address: "789 Maple Ave.", shifts: [] },
  ]);