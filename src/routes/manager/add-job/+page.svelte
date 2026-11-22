<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { locations } from '#lib/shared.svelte.ts';
  import type { Shift } from '#lib/shared.svelte.ts';
  import type { CalendarDay } from '#lib/Calender.svelte';
  import JobShared, { readJobFilters, validateShiftTime } from '#lib/JobShared.svelte';
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
    error = "";
    if (day) {
      newDate = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    }
  }

  // Initialize in a way that doesn't read URL data immediately
  let loc = $state<string | null>(null);
  let dashboardFilters = $state<ReturnType<typeof readJobFilters> | null>(null);

  // Read the URL in the browser, after the page mounts
  onMount(() => {
    const params = page.url.searchParams;
    dashboardFilters = readJobFilters(params);
    loc = dashboardFilters.loc;
    newDate = dashboardFilters.sd;
    newStartTime = dashboardFilters.st || "09:00";
    newEndTime = dashboardFilters.et || "17:00";
    if (!locations.some(item => item.address === loc)) {
      error = "Choose a location on the manager dashboard before adding a shift.";
    }
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  function addShift(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    if (!selectedLocation) {
      error = "Choose a location on the manager dashboard before adding a shift.";
      return;
    }

    const times = validateShiftTime(newDate, newStartTime, newEndTime);
    if (!times) {
      error = "Choose a date and whole-hour times, with the end after the start.";
      return;
    }
    const { date, start, end } = times;
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

</script>

<JobShared {selectedLocation} {dashboardFilters}
  bind:selectedDay={() => selectedDay, selectDay}
  bind:selectedShift>
  <h2>Add Shift</h2>

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
</JobShared>


<style>
  .add-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
