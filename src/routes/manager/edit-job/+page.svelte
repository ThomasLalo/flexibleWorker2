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
  let selectedShifts = $state<Shift[]>([]);
  let editDate = $state("");
  let editStartTime = $state("");
  let editEndTime = $state("");
  let editRole = $state("handler");
  let error = $state("");

  function selectShifts(shifts: Shift[]) {
    selectedShifts = shifts;
    error = "";
    const shift = shifts[0];
    if (!shift) return;

    const year = selectedDay?.year ?? calendarDate?.getFullYear() ?? new Date().getFullYear();
    editDate = shifts.every(item => item.month === shift.month && item.day === shift.day)
      ? `${year}-${String(shift.month).padStart(2, '0')}-${String(shift.day).padStart(2, '0')}` : "";
    editStartTime = shifts.every(item => item.startTime === shift.startTime)
      ? `${String(shift.startTime).padStart(2, '0')}:00` : "";
    editEndTime = shifts.every(item => item.endTime === shift.endTime)
      ? `${String(shift.endTime).padStart(2, '0')}:00` : "";
    editRole = shifts.every(item => item.role === shift.role) ? shift.role : "";
  }

  function selectDay(day: CalendarDay | null) {
    selectedDay = day;
    selectShifts([]);
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
    selectShifts([shift]);
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  function saveShift(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    if (!selectedShifts.length || !selectedLocation ||
        selectedShifts.some(shift => !selectedLocation.shifts.includes(shift))) {
      error = "Choose shifts to edit.";
      return;
    }

    if (editRole && editRole !== "handler" && editRole !== "courier") {
      error = "Choose a handler or courier role.";
      return;
    }

    // Validate every resulting schedule before mutating any shift.
    const year = selectedDay?.year ?? new Date().getFullYear();
    const updates = selectedShifts.map(shift => ({
      shift,
      times: validateShiftTime(
        editDate || `${year}-${String(shift.month).padStart(2, '0')}-${String(shift.day).padStart(2, '0')}`,
        editStartTime || `${String(shift.startTime).padStart(2, '0')}:00`,
        editEndTime || `${String(shift.endTime).padStart(2, '0')}:00`
      )
    }));
    if (updates.some(update => !update.times)) {
      error = "Every selected shift must have whole-hour times, with the end after the start. No changes were saved.";
      return;
    }

    for (const { shift, times } of updates) {
      if (!times) continue;
      const { date, start, end } = times;
      const scheduleChanged = shift.month !== date.getMonth() + 1 ||
        shift.day !== date.getDate() || shift.startTime !== start || shift.endTime !== end;

      shift.month = date.getMonth() + 1;
      shift.day = date.getDate();
      shift.startTime = start;
      shift.endTime = end;
      if (editRole) shift.role = editRole;
      if (scheduleChanged) shift.timeChanged = true;
    }
    goto(resolve('/manager'));
  }

</script>

<JobShared {selectedLocation} {dashboardFilters} {calendarDate}
  multiple
  pageError={!selectedDay ? error : ''}
  bind:selectedDay={() => selectedDay, selectDay}
  bind:selectedShifts={() => selectedShifts, selectShifts}>
  <h2>{selectedShifts.length > 1 ? `Edit ${selectedShifts.length} Shifts` : 'Edit Shift'}</h2>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if selectedShifts.length}
    {#if selectedShifts.length > 1}
      <p>Shared values are filled in. Blank fields keep each shift's current value.
        Changes apply to all {selectedShifts.length} selected shifts.</p>
    {/if}
    <form class="edit-form" onsubmit={saveShift}>
      <label>Date <input type="date" bind:value={editDate} required={selectedShifts.length === 1} /></label>
      <label>Start time <input type="time" bind:value={editStartTime} step="3600" required={selectedShifts.length === 1} /></label>
      <label>End time <input type="time" bind:value={editEndTime} step="3600" required={selectedShifts.length === 1} /></label>
      <label>Role
        <select bind:value={editRole}>
          {#if selectedShifts.length > 1}<option value="">Keep each shift's role</option>{/if}
          <option value="handler">Handler</option>
          <option value="courier">Courier</option>
        </select>
      </label>
      <button type="submit">{selectedShifts.length > 1 ? `Save changes to ${selectedShifts.length} shifts` : 'Save changes'}</button>
    </form>
  {:else if !error}
    <p>Select one or more shifts to edit. Selecting shifts fills in the form with their shared values.</p>
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
