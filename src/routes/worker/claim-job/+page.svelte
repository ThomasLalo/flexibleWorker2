<script lang="ts">
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
  
  const loc = page.url.searchParams.get("location");
  const sd = page.url.searchParams.get("startDate")!;
  const ed = page.url.searchParams.get("endDate")!;
  const st = page.url.searchParams.get("startTime")!;
  const et = page.url.searchParams.get("endTime")!;
  const selectedLocation = locations.find(item => item.address === loc);

  const startDate = new Date(sd + "T00:00");
  const endDate = new Date(ed + "T00:00");
  const startHour = parseInt(st);
  const endHour = parseInt(et);

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const date = new Date(startDate.getFullYear(), shift.month - 1, shift.day);
      return (
        date >= startDate &&
        date <= endDate &&
        shift.startTime >= startHour &&
        shift.endTime <= endHour &&
        shift.role == role
      );
    }) ?? [] //typescript warning avoidance
  );

  const unclaimedShifts = $derived(
    shiftsInRange.filter(shift => !shift.worker && !shift.canceled)
  );

  const claimedShifts = $derived(
    selectedLocation?.shifts.filter(
      shift => shift.worker === worker
    ) ?? []
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

</script>

<!-- I'm not sure where the codepen for this form ended up -->

<main>
  <div class = "panel">
    <a href={resolve('/worker')}>&lt;&lt;&lt; Back to dashboard</a>
    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate}
      bind:selectedDay={() => selectedDay, selectDay} bind:selectedShift/>
  </div>
  <div class="panel claim-panel">
    <h2>
      {selectedDay
        ? `Shifts for ${selectedDay.month}/${selectedDay.day}/${selectedDay.year}`
        : 'Select a day'}
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

  .panel {
    padding: 1rem;
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
