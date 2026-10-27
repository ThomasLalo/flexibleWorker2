<script lang="ts">
  import { goto } from '$app/navigation';
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
  // const worker = "Emma Johnson";
  // const role = $derived(
  //   roster.find(person => person.name === worker)?.role
  // );
  
  const loc = page.url.searchParams.get("location");
  // more or less typing the value to be preset input or empty string. avoids TS/svelte compiler warnings
  let sd = $state(page.url.searchParams.get("startDate") ?? "");
  let ed = $state(page.url.searchParams.get("endDate") ?? "");
  let st = $state(page.url.searchParams.get("startTime") ?? "");
  let et = $state(page.url.searchParams.get("endTime") ?? "");
  const selectedLocation = locations.find(item => item.address === loc);

  // new Date("" + "T00:00") would cause an error
  let startDate = $derived(sd ? new Date(sd + "T00:00") : null);
  let endDate = $derived(ed ? new Date(ed + "T00:00") : null);
  // parseInt("") === NaN
  let startHour = $derived(st ? parseInt(st) : null);
  let endHour = $derived(et ? parseInt(et) : null);

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const year = startDate?.getFullYear() ?? new Date().getFullYear();
      const date = new Date(year, shift.month - 1, shift.day);
      return (
        // if null give true since that part of the filter does not apply
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate) &&
        (startHour === null || shift.startTime >= startHour) &&
        (endHour === null || shift.endTime <= endHour)
      );
    }) ?? []
  );

  const unclaimedShifts = $derived(
    shiftsInRange.filter(shift => !shift.worker) ?? []
  );

  const claimedShifts = $derived(
    shiftsInRange.filter(shift => shift.worker != null) ?? []
  );

  const shiftsForSelectedDay = $derived.by(() => {
    const day = selectedDay;
    return day
      ? [...claimedShifts, ...unclaimedShifts].filter(
          shift => shift.month === day.month && shift.day === day.day
        )
      : [];
  });

  function addShift() {
    return;
  }

  function clearFilters() {
  sd = ed = st = et = "";
  selectedDay = null;
}

</script>

<!-- I'm not sure where the codepen for this form ended up -->

<main>
  <div class = "panel">
    <a href="/manager">&lt;&lt;&lt; Back to dashboard</a>
    <fieldset>
      <legend>Date Range</legend>
      <input type="date" bind:value={sd} />
      -
      <input type="date" bind:value={ed} />
    </fieldset>

    <fieldset>
      <legend>Time Range</legend>
      <input type="time" bind:value={st} />
      -
      <input type="time" bind:value={et} />
    </fieldset>

    <button type="button" aria-label="clear filters" onclick={clearFilters}> clear filters</button>

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
        {#each shiftsInRange as shift (shift)}
          <button type="button" class="shift-option"
            class:claimed={Boolean(shift.worker)}
            class:selected={shift === selectedShift}
            onclick={() => selectedShift = shift}>
            <span>{shift.month}/{shift.day} {shift.startTime}:00 - {shift.endTime}:00 </span>
            <span>{shift.role.charAt(0).toUpperCase() + shift.role.slice(1)} - {shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
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
    <h1>Add Shift</h1>

    <!-- <h3>Job description: </h3>
    <p class="job-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget dignissim eros. Quisque magna dolor, rhoncus in lacinia in, volutpat in sem. Suspendisse iaculis pretium felis quis consequat. Cras eget condimentum neque, non molestie nulla. Vivamus vitae luctus magna.</p>
    <h3>Requirements: </h3>
    <p>CDL</p>
    <h3>Location: </h3>
    <p>123 Address Dr</p>

    <h3>Claim 9-5 shift on September 29? </h3> -->
    <button type="button" onclick={addShift}>confirm</button>

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

</style>
