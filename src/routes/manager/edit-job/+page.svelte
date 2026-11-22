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
  let editDate = $state("");
  let editStartTime = $state("");
  let editEndTime = $state("");
  let editRole = $state("handler");
  let error = $state("");

  function selectShift(shift: Shift | null) {
    selectedShift = shift;
    error = "";
    if (!shift) return;

    const year = selectedDay?.year ?? calendarDate?.getFullYear() ?? new Date().getFullYear();
    editDate = `${year}-${String(shift.month).padStart(2, '0')}-${String(shift.day).padStart(2, '0')}`;
    editStartTime = `${String(shift.startTime).padStart(2, '0')}:00`;
    editEndTime = `${String(shift.endTime).padStart(2, '0')}:00`;
    editRole = shift.role;
  }

  function selectDay(day: CalendarDay | null) {
    selectedDay = day;
    selectShift(null);
  }

  // Initialize in a way that doesn't read URL data immediately
  let loc = $state<string | null>(null);
  let dashboardFilters = $state<ReturnType<typeof readJobFilters> | null>(null);
  let calendarDate = $state<Date | null>(null);

  // Read the URL in the browser, after the page mounts
  onMount(() => {
    const params = page.url.searchParams;
    dashboardFilters = readJobFilters(params);
    loc = dashboardFilters.loc;

    const location = locations.find(item => item.address === loc);
    const indexParam = params.get("index");
    if (indexParam === null) return;
    const index = indexParam !== null && /^\d+$/.test(indexParam) ? Number(indexParam) : -1;
    const shift = Number.isSafeInteger(index) && index >= 0 ? location?.shifts[index] : undefined;
    if (!shift) {
      error = "The selected shift could not be found. Return to the dashboard and choose a shift.";
      return;
    }
    const dashboardDate = dashboardFilters.sd || dashboardFilters.ed;
    const year = dashboardDate ? new Date(dashboardDate + "T00:00").getFullYear() : new Date().getFullYear();
    calendarDate = new Date(year, shift.month - 1, shift.day);
    selectDay({ year, month: shift.month, day: shift.day });
    selectShift(shift);
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  function saveShift(event: SubmitEvent) {
    event.preventDefault();
    const shift = selectedShift;
    if (!shift || !selectedLocation?.shifts.includes(shift)) {
      error = "Choose a shift to edit.";
      return;
    }

    const times = validateShiftTime(editDate, editStartTime, editEndTime);
    if (!times) {
      error = "Choose a date and whole-hour times, with the end after the start.";
      return;
    }
    const { date, start, end } = times;

    const scheduleChanged = shift.month !== date.getMonth() + 1 ||
      shift.day !== date.getDate() || shift.startTime !== start || shift.endTime !== end;

    shift.month = date.getMonth() + 1;
    shift.day = date.getDate();
    shift.startTime = start;
    shift.endTime = end;
    shift.role = editRole;
    if (scheduleChanged) shift.timeChanged = true;
    goto(resolve('/manager'));
  }

</script>

<JobShared {selectedLocation} {dashboardFilters} {calendarDate}
  pageError={!selectedDay ? error : ''}
  bind:selectedDay={() => selectedDay, selectDay}
  bind:selectedShift={() => selectedShift, selectShift}>
  <h2>Edit Shift</h2>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if selectedShift}
    <form class="edit-form" onsubmit={saveShift}>
      <label>Date <input type="date" bind:value={editDate} required /></label>
      <label>Start time <input type="time" bind:value={editStartTime} step="3600" required /></label>
      <label>End time <input type="time" bind:value={editEndTime} step="3600" required /></label>
      <label>Role
        <select bind:value={editRole}>
          <option value="handler">Handler</option>
          <option value="courier">Courier</option>
        </select>
      </label>
      <button type="submit">Save changes</button>
    </form>
  {:else if !error}
    <p>Select a shift to edit.</p>
  {/if}
</JobShared>


<style>
  .edit-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
