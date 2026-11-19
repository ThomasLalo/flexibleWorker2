<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { locations } from '#lib/shared.svelte.ts';
  import type { Shift } from '#lib/shared.svelte.ts';
  import Calender, { type CalendarDay } from '#lib/Calender.svelte';
  import { resolve } from '$app/paths';


  let selectedDay = $state<CalendarDay | null>(null);
  let selectedShift = $state<Shift | null>(null);
  let newDate = $state("");
  let newStartTime = $state("");
  let newEndTime = $state("");
  let newRole = $state("handler");
  let error = $state("");

  function selectDay(day: CalendarDay | null) {
    selectedDay = day;
    selectedShift = null;
    if (day) {
      newDate = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    }
  }

  // Initialize in a way that doesn't read URL data immediately
  let loc = $state<string | null>(null);
  let sd = $state("");
  let ed = $state("");
  let st = $state("");
  let et = $state("");

  // Read the URL in the browser, after the page mounts
  onMount(() => {
    const params = page.url.searchParams;
    loc = params.get("location");
    sd = params.get("startDate") ?? "";
    ed = params.get("endDate") ?? "";
    st = params.get("startTime") ?? "";
    et = params.get("endTime") ?? "";
    newDate = sd;
    newStartTime = st || "09:00";
    newEndTime = et || "17:00";
    if (!locations.some(item => item.address === loc)) {
      error = "Choose a location on the manager dashboard before adding a shift.";
    }
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

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

  function addShift(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    if (!selectedLocation) {
      error = "Choose a location on the manager dashboard before adding a shift.";
      return;
    }

    const date = new Date(newDate + "T00:00");
    const start = Number(newStartTime.split(':')[0]);
    const end = Number(newEndTime.split(':')[0]);
    if (!newDate || Number.isNaN(date.getTime()) ||
        !/^\d{2}:00$/.test(newStartTime) || !/^\d{2}:00$/.test(newEndTime) ||
        start < 0 || end > 23 || start >= end) {
      error = "Choose a date and whole-hour times, with the end after the start.";
      return;
    }
    if (newRole !== "handler" && newRole !== "courier") {
      error = "Choose a handler or courier role.";
      return;
    }

    selectedLocation.shifts.push({
      month: date.getMonth() + 1,
      day: date.getDate(),
      startTime: start,
      endTime: end,
      role: newRole
    });
    selectedLocation.shifts.sort((a, b) =>
      a.month - b.month ||
      a.day - b.day ||
      a.startTime - b.startTime ||
      a.endTime - b.endTime
    );
    goto(resolve('/manager'));
  }

  function clearFilters() {
  sd = ed = st = et = "";
  selectedDay = null;
}

</script>

<!-- I'm not sure where the codepen for this form ended up -->

<main>
  <div class = "panel">
    <div class = "control-panel">

      <a href={resolve("/manager")}>&lt;&lt;&lt; Back to dashboard</a>
      <h1>{selectedLocation?.address}</h1>

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
    </div>

    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate}
      bind:selectedDay={() => selectedDay, selectDay} bind:selectedShift/>
  </div>

  <div class="panel claim-panel">
    <h1>Add Shift</h1>

    {#if error}<p role="alert">{error}</p>{/if}
    {#if selectedLocation}
      <p>Location: {selectedLocation.address}</p>
      <form class="add-form" onsubmit={addShift}>
        <label>Date <input type="date" bind:value={newDate} required /></label>
        <label>Start time <input type="time" bind:value={newStartTime} step="3600" required /></label>
        <label>End time <input type="time" bind:value={newEndTime} step="3600" required /></label>
        <label>Role
          <select bind:value={newRole}>
            <option value="handler">Handler</option>
            <option value="courier">Courier</option>
          </select>
        </label>
        <button type="submit">Add shift</button>
      </form>
    {/if}

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
            <span>{shift.startTime}:00-{shift.endTime}:00 - {shift.role.charAt(0).toUpperCase()+ shift.role.slice(1)}</span>
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
        {selectedShift.startTime}:00-{selectedShift.endTime}:00
      </p>
    {/if}


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

  .add-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
