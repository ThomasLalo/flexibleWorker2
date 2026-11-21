<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { locations } from '#lib/shared.svelte.ts';
  import { roster } from '#lib/shared.svelte.ts';
  import type { Shift } from '#lib/shared.svelte.ts';
  import type { CalendarDay } from '#lib/Calender.svelte';
  import JobShared, { readJobFilters } from '#lib/JobShared.svelte';

  let selectedDay = $state<CalendarDay | null>(null);
  let selectedShift = $state<Shift | null>(null);

  function selectDay(day: CalendarDay | null) {
    selectedDay = day;
    selectedShift = null;
  }
  const worker = "Emma Johnson";
  const role = $derived(
    roster.find(person => person.name === worker)?.role
  );
  
  let loc = $state<string | null>(null);
  let sd = $state("");
  let ed = $state("");
  let st = $state("");
  let et = $state("");

  // Read the URL in the browser, after the page mounts.
  onMount(() => {
    const params = page.url.searchParams;
    ({ loc, sd, ed, st, et } = readJobFilters(params));
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  function claimShift() {
    if (selectedShift !== null && !selectedShift.worker && !selectedShift.canceled) {
      selectedShift.worker = worker;
      goto(resolve('/worker'));
    }
  };

  function clearFilters() {
    sd = ed = st = et = "";
    selectDay(null);
  }

</script>

<!-- I'm not sure where the codepen for this form ended up -->

<JobShared {selectedLocation} bind:sd bind:ed bind:st bind:et {clearFilters} {worker} {role}
  bind:selectedDay={() => selectedDay, selectDay}
  bind:selectedShift>
  <h1>Claim Shift</h1>

  <!-- <h3>Job description: </h3>
  <p class="job-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget dignissim eros. Quisque magna dolor, rhoncus in lacinia in, volutpat in sem. Suspendisse iaculis pretium felis quis consequat. Cras eget condimentum neque, non molestie nulla. Vivamus vitae luctus magna.</p>
  <h3>Requirements: </h3>
  <p>CDL</p>
  <h3>Location: </h3>
  <p>123 Address Dr</p>

  <h3>Claim 9-5 shift on September 29? </h3> -->
  <button type="button" onclick={claimShift}>confirm</button>
</JobShared>


<style>
  /* .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    max-width: 700px;
  }

  .label {
    font-weight: bold;
    text-align: center;
    padding-bottom: 4px;
  }

  .day {
    aspect-ratio: 1;
    padding: 4px;
    border: 1px solid purple;
    border-radius: 4px;
  }

  .day:hover {
    background-color: purple;
    color: white;
  }

  .day.empty {
    border: none;
  }

  .day.empty:hover {
    background-color: white;
  }

  .shift {
    background-color: orange;
    text-align: center;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    margin-top: 2px;
  }

  .shift-tooltip {
    visibility: hidden;
    position: absolute;
    top: 50%;
    left: 110%;
    transform: translateY(-50%);
    z-index: 1;
    background-color: white;
    color: black;
    padding: 4px 4px;
    border-radius: 4px;
    border: 1px solid black;
    width: 200px;
  }

  .shift-tooltip::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -5px;
    width: 10px;
    height: 10px;
    box-sizing: border-box;
    background-color: inherit;
    border-left: inherit;
    border-bottom: inherit;
    transform: translateY(-50%) rotate(45deg);
  }

  .shift:hover .shift-tooltip {
    visibility: visible;
  }

  .selected-day {
    background-color: purple;
    color: white;
  }

  .selected-shift {
    background-color: white;
    color: black;
  } */

  .job-description {
    max-width: 45ch;
  }

</style>
