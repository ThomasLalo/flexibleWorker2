<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { locations } from '#lib/shared.svelte.ts';
  import { roster } from '#lib/shared.svelte.ts';
  import type { Shift } from '#lib/shared.svelte.ts';
  import Calender, { type CalendarDay } from '#lib/Calender.svelte';

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
    loc = params.get("location");
    sd = params.get("startDate") ?? "";
    ed = params.get("endDate") ?? "";
    st = params.get("startTime") ?? "";
    et = params.get("endTime") ?? "";
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  const startDate = $derived(sd ? new Date(sd + "T00:00") : null);
  const endDate = $derived(ed ? new Date(ed + "T00:00") : null);
  const startHour = $derived(st ? parseInt(st) : null);
  const endHour = $derived(et ? parseInt(et) : null);

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const year = startDate?.getFullYear() ?? endDate?.getFullYear() ?? new Date().getFullYear();
      const date = new Date(year, shift.month - 1, shift.day);
      return (
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate) &&
        (startHour === null || shift.startTime >= startHour) &&
        (endHour === null || shift.endTime <= endHour) &&
        shift.role == role
      );
    }) ?? [] //typescript warning avoidance
  );

  const unclaimedShifts = $derived(
    shiftsInRange.filter(shift => !shift.worker && !shift.canceled)
  );

  const claimedShifts = $derived(
    shiftsInRange.filter(
      shift => shift.worker === worker
    )
  );

  const shiftsForSelectedDay = $derived.by(() => {
    const day = selectedDay;
    return day
      ? [...claimedShifts, ...unclaimedShifts].filter(
          shift => shift.month === day.month && shift.day === day.day
        )
      : [];
  });

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

<main>
  <div class = "panel">
    <div class="control-panel">
      <a href={resolve('/worker')}>&lt;&lt;&lt; Back to dashboard</a>
      <h1>{selectedLocation?.address}</h1>
      <fieldset>
        <legend>Date Range</legend>
        <input type="date" aria-label="Start date" bind:value={sd} onchange={() => selectDay(null)} />
        -
        <input type="date" aria-label="End date" bind:value={ed} onchange={() => selectDay(null)} />
      </fieldset>

      <fieldset>
        <legend>Time Range</legend>
        <input type="time" aria-label="Start time" bind:value={st} onchange={() => selectDay(null)} />
        -
        <input type="time" aria-label="End time" bind:value={et} onchange={() => selectDay(null)} />
      </fieldset>

      <button type="button" onclick={clearFilters}>Clear filters</button>
    </div>


    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate}
      bind:selectedDay={() => selectedDay, selectDay} bind:selectedShift/>
  </div>
  <div class="panel claim-panel">
    <h2>
      {selectedDay
        ? `Shifts for ${selectedDay.month}/${selectedDay.day}/${selectedDay.year}`
        : 'Shifts in range'}
    </h2>
    {#if selectedDay}
      <div class="day-shift-list">
        {#each shiftsForSelectedDay as shift (shift)}
          <button type="button" class="shift-option"
            class:claimed={Boolean(shift.worker)}
            class:selected={shift === selectedShift}
            onclick={() => selectedShift = shift}>
            <span>{shift.startTime}:00–{shift.endTime}:00 ({shift.role})</span>
            <span>{shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
            {#if shift.canceled}<span>Canceled</span>{/if}
          </button>
        {:else}
          <p>No matching shifts on this day.</p>
        {/each}
      </div>
    {:else}
      <!-- <p>Select a calendar day to see all its matching shifts.</p> -->
      <div class="day-shift-list">
        {#each unclaimedShifts as shift (shift)}
          <button type="button" class="shift-option"
            class:claimed={Boolean(shift.worker)}
            class:selected={shift === selectedShift}
            onclick={() => selectedShift = shift}>
            <span>{shift.startTime}:00–{shift.endTime}:00 ({shift.role})</span>
            <span>{shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
            {#if shift.canceled}<span>Canceled</span>{/if}
          </button>
        {:else}
          <p>No matching shifts on this day.</p>
        {/each}
      </div>
    {/if}
    {#if selectedShift}
      <p>
        Selected: {selectedShift.month}/{selectedShift.day},
        {selectedShift.startTime}:00–{selectedShift.endTime}:00
      </p>
    {/if}
    <h1>Claim Shift</h1>

    <!-- <h3>Job description: </h3>
    <p class="job-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget dignissim eros. Quisque magna dolor, rhoncus in lacinia in, volutpat in sem. Suspendisse iaculis pretium felis quis consequat. Cras eget condimentum neque, non molestie nulla. Vivamus vitae luctus magna.</p>
    <h3>Requirements: </h3>
    <p>CDL</p>
    <h3>Location: </h3>
    <p>123 Address Dr</p>

    <h3>Claim 9-5 shift on September 29? </h3> -->
    <button type="button" onclick={claimShift}>confirm</button>

</div>
</main>


<style>

  main {
    display: flex;
    justify-content: center;
    font-family: sans-serif;
    padding: 20px;
    margin: 0;
  }
  @media (max-width: 800px) {
    main {
      flex-direction: column;
    }
  }

  .panel {
    padding: 1rem;
  }

  .control-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-panel button {
    align-self: flex-start;
  }

  .control-panel h1 {
    color: #4D148C;
    margin: 0;
  }

  .day-shift-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shift-option {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    border: 1px solid #4D148C;
    border-radius: 4px;
    background-color: #CCCCCC;
    color: black;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .shift-option.claimed {
    background-color: #FF6600;
  }

  .shift-option.selected {
    background-color: #333333;
    color: white;
    outline: 2px solid #4D148C;
  }

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
