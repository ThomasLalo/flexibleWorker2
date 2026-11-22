<script module lang="ts">
  // Helpers used by the -job pages
  export function readJobFilters(params: Pick<URLSearchParams, 'get'>) {
    return {
      loc: params.get("location"),
      sd: params.get("startDate") ?? "",
      ed: params.get("endDate") ?? "",
      st: params.get("startTime") ?? "",
      et: params.get("endTime") ?? ""
    };
  }

  export function validateShiftTime(dateValue: string, startTime: string, endTime: string) {
    const date = new Date(dateValue + "T00:00");
    const start = Number(startTime.split(':')[0]);
    const end = Number(endTime.split(':')[0]);
    if (!dateValue || Number.isNaN(date.getTime()) ||
        !/^\d{2}:00$/.test(startTime) || !/^\d{2}:00$/.test(endTime) ||
        start < 0 || end > 23 || start >= end) {
      return null;
    }
    return { date, start, end };
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolve } from '$app/paths';
  import type { Location, Shift } from '#lib/shared.svelte.ts';
  import Calender, { type CalendarDay } from '#lib/Calender.svelte';

  let {
    selectedLocation,
    dashboardFilters = null,
    calendarDate = null,
    selectedDay = $bindable(null),
    selectedShift = $bindable(null),
    worker,
    role,
    pageError = "",
    children
  }: {
    selectedLocation: Location | undefined;
    dashboardFilters?: ReturnType<typeof readJobFilters> | null;
    calendarDate?: Date | null;
    selectedDay?: CalendarDay | null;
    selectedShift?: Shift | null;
    worker?: string;
    role?: string;
    pageError?: string;
    children: Snippet;
  } = $props();

  // Dashboard values remain a preset until the user explicitly applies them.
  let sd = $state("");
  let ed = $state("");
  let st = $state("");
  let et = $state("");
  let roleFilter = $state("");
  let dashboardFiltersApplied = $state(false);
  let dialog: HTMLDialogElement;

  $effect(() => {
    if (selectedDay) dialog.showModal();
    else dialog.close();
  });

  function closeDay() {
    selectedDay = null;
    selectedShift = null;
  }

  function applyDashboardFilters() {
    if (!dashboardFilters) return;
    ({ sd, ed, st, et } = dashboardFilters);
    dashboardFiltersApplied = true;
    closeDay();
  }

  function clearFilters() {
    sd = ed = st = et = roleFilter = "";
    closeDay();
  }

  // Claim-job always restricts shifts to the worker's role.
  const isClaimPage = $derived(worker !== undefined);
  const hasDashboardFilters = $derived(Boolean(
    dashboardFilters && (dashboardFilters.sd || dashboardFilters.ed || dashboardFilters.st || dashboardFilters.et)
  ));
  const dashboardDate = $derived(dashboardFilters?.sd || dashboardFilters?.ed);
  const initialDate = $derived(calendarDate ?? (dashboardDate ? new Date(dashboardDate + "T00:00") : null));

  // new Date("" + "T00:00") would cause an error
  const startDate = $derived(sd ? new Date(sd + "T00:00") : null);
  const endDate = $derived(ed ? new Date(ed + "T00:00") : null);
  // parseInt("") === NaN
  const startHour = $derived(st ? parseInt(st) : null);
  const endHour = $derived(et ? parseInt(et) : null);
  const hasFilters = $derived(Boolean(sd || ed || st || et || (!isClaimPage && roleFilter)));
  const invalidDateRange = $derived(Boolean(sd && ed && sd > ed));
  const invalidTimeRange = $derived(
    startHour !== null && endHour !== null && startHour > endHour
  );

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const year = startDate?.getFullYear() ??
        endDate?.getFullYear() ?? initialDate?.getFullYear() ?? new Date().getFullYear();
      const date = new Date(year, shift.month - 1, shift.day);
      return (
        // if null give true since that part of the filter does not apply
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate) &&
        (startHour === null || shift.startTime >= startHour) &&
        (endHour === null || shift.endTime <= endHour) &&
        (isClaimPage ? shift.role === role : !roleFilter || shift.role === roleFilter)
      );
    }) ?? []
  );

  const unclaimedShifts = $derived(
    shiftsInRange.filter(shift => !shift.worker && (!isClaimPage || !shift.canceled))
  );

  const claimedShifts = $derived(
    shiftsInRange.filter(shift => isClaimPage ? shift.worker === worker : shift.worker != null)
  );

  const shiftsForSelectedDay = $derived.by(() => {
    const day = selectedDay;
    return day
      ? [...claimedShifts, ...unclaimedShifts].filter(
          shift => shift.month === day.month && shift.day === day.day
        )
      : [];
  });

  function formatTime(time: string) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  }

  function formatDate(value: string) {
    return new Date(value + "T00:00").toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
</script>

<main>
  <div class="panel">
    <div class="control-panel">
      <a href={isClaimPage ? resolve('/worker') : resolve('/manager')}>&lt;&lt;&lt; Back to dashboard</a>
      <h1>{selectedLocation?.address}</h1>
      {#if !selectedLocation}
        <p role="alert">Choose a location on the dashboard to view shifts.</p>
      {:else if pageError}
        <p role="alert">{pageError}</p>
      {/if}

      <div class="filters">
        {#if hasDashboardFilters && dashboardFilters && !dashboardFiltersApplied}
          <div class="dashboard-preset">
            <strong>Dashboard selection</strong>
            <div class="filter-summary">
              {#if dashboardFilters.sd || dashboardFilters.ed}
                <span>
                  {#if dashboardFilters.sd}From {formatDate(dashboardFilters.sd)}{/if}
                  {#if dashboardFilters.ed}{dashboardFilters.sd ? 'through' : 'Through'} {formatDate(dashboardFilters.ed)}{/if}
                </span>
              {/if}
              {#if dashboardFilters.st || dashboardFilters.et}
                <span>
                  {#if dashboardFilters.st}Starting at or after {formatTime(dashboardFilters.st)}{/if}
                  {#if dashboardFilters.et}{dashboardFilters.st ? 'and ending' : 'Ending'} by {formatTime(dashboardFilters.et)}{/if}
                </span>
              {/if}
            </div>
            <button type="button" onclick={applyDashboardFilters}>Apply dashboard filters</button>
          </div>
        {/if}
        <details>
          <summary>
            <strong>{isClaimPage ? 'Filter by date and time' : 'Filter by date, time, and role'}</strong>
            <span class="filter-summary">
              {#if !hasFilters}
                {isClaimPage ? 'All dates and times' : 'All dates, times, and roles'}
              {:else}
                {#if !sd && !ed && !st && !et}<span>All dates and times</span>{/if}
                {#if sd || ed}
                  <span>
                    {#if sd}From {formatDate(sd)}{/if}
                    {#if ed}{sd ? 'through' : 'Through'} {formatDate(ed)}{/if}
                  </span>
                {/if}
                {#if st || et}
                  <span>
                    {#if st}Starting at or after {formatTime(st)}{/if}
                    {#if et}{st ? 'and ending' : 'Ending'} by {formatTime(et)}{/if}
                  </span>
                {/if}
                {#if !isClaimPage}
                  <span>{roleFilter ? (roleFilter === 'handler' ? 'Handler' : 'Courier') : 'All roles'}</span>
                {/if}
                {#if invalidDateRange || invalidTimeRange}
                  <span class="filter-error">Check the range below.</span>
                {/if}
              {/if}
            </span>
          </summary>

          <div class="filter-controls">
            <fieldset>
              <legend>Date Range</legend>
              <div class="filter-range">
                <input type="date" aria-label="Start date" bind:value={sd}
                  onchange={closeDay} />
                <span class="range-separator">-</span>
                <input type="date" aria-label="End date" bind:value={ed}
                  onchange={closeDay} />
              </div>
              {#if invalidDateRange}
                <p class="filter-error">End date must be on or after the start date.</p>
              {/if}
            </fieldset>

            <fieldset>
              <legend>Time Range</legend>
              <div class="filter-range">
                <input type="time" aria-label="Start time" bind:value={st}
                  onchange={closeDay} />
                <span class="range-separator">-</span>
                <input type="time" aria-label="End time" bind:value={et}
                  onchange={closeDay} />
              </div>
              {#if invalidTimeRange}
                <p class="filter-error">End time must not be before the start time.</p>
              {/if}
            </fieldset>

            {#if !isClaimPage}
              <fieldset>
                <legend>Role</legend>
                <select aria-label="Filter by role" bind:value={roleFilter} onchange={closeDay}>
                  <option value="">All roles</option>
                  <option value="handler">Handler</option>
                  <option value="courier">Courier</option>
                </select>
              </fieldset>
            {/if}

            <button type="button" aria-label="clear filters" onclick={clearFilters}
              disabled={!hasFilters}>
              Clear filters
            </button>
          </div>
        </details>
      </div>


    </div>

    <p>Select a day to view shifts and continue.</p>
    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate} {initialDate}
      bind:selectedDay bind:selectedShift/>
  </div>

  <dialog bind:this={dialog} onclose={closeDay} aria-labelledby="day-dialog-title">
    <div class="dialog-header">
      <h2 id="day-dialog-title">
        {selectedDay ? `Shifts for ${selectedDay.month}/${selectedDay.day}/${selectedDay.year}` : 'Shifts'}
      </h2>
      <button type="button" onclick={() => dialog.close()}>Close</button>
    </div>
    <div class="dialog-content">
      <div class="day-shift-list">
        {#each shiftsForSelectedDay as shift (shift)}
          <button type="button" class="shift-option"
            class:claimed={Boolean(shift.worker)}
            class:selected={shift === selectedShift}
            aria-pressed={shift === selectedShift}
            onclick={() => selectedShift = shift}>
            <span class="shift-heading">{shift.startTime}:00-{shift.endTime}:00 - {shift.role.charAt(0).toUpperCase()+ shift.role.slice(1)}</span>
            <span class="shift-status">{shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
            {#if shift.canceled}<span class="shift-canceled">Canceled</span>{/if}
          </button>
        {:else}
          <p>No matching shifts on this day.</p>
        {/each}
      </div>

      <div class="day-form">
        {#if selectedShift}
          <p>
            Selected: {selectedShift.month}/{selectedShift.day},
            {selectedShift.startTime}:00-{selectedShift.endTime}:00
          </p>
        {/if}
        {@render children()}
      </div>
    </div>
  </dialog>
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
    box-sizing: border-box;
    width: 100%;
    max-width: 732px;
    padding: 1rem;
  }

  dialog {
    box-sizing: border-box;
    width: min(800px, calc(100% - 2rem));
    max-height: calc(100dvh - 2rem);
    padding: 1.5rem;
    border: 1px solid #b9afc3;
    border-radius: 8px;
    color: #333;
    background: white;
    font: inherit;
    overflow: auto;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 45%);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .dialog-header h2 {
    margin: 0;
    color: #4D148C;
  }

  .dialog-header button {
    padding: 0.5rem 0.75rem;
    font: inherit;
    cursor: pointer;
  }

  .dialog-content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
    gap: 1.5rem;
  }

  .day-form {
    min-width: 0;
  }

  @media (max-width: 600px) {
    .dialog-content {
      grid-template-columns: minmax(0, 1fr);
    }

    dialog {
      padding: 1rem;
    }
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

  .filters {
    background-color: #faf8fc;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }

  .filters summary {
    color: #4D148C;
    cursor: pointer;
    line-height: 1.5;
  }

  .filter-summary {
    display: grid;
    gap: 0.25rem;
    margin-top: 0.35rem;
    color: #62596b;
    font-size: 0.9rem;
  }

  .filter-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dcd5e2;
  }

  .dashboard-preset {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #dcd5e2;
  }

  .filters fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .filters legend {
    margin-bottom: 0.5rem;
    padding: 0;
    font-weight: 600;
  }

  .filter-range {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 0.75rem;
  }

  .filters input,
  .filters select {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #b9afc3;
    border-radius: 4px;
    background-color: white;
    color: #333;
    font: inherit;
  }

  .filters button {
    padding: 0.5rem 0.75rem;
    border: 1px solid #b9afc3;
    border-radius: 4px;
    background: transparent;
    color: #4D148C;
    font: inherit;
    cursor: pointer;
  }

  .filters button:hover:not(:disabled) {
    background-color: #ebddf7;
  }

  .filters button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .filters input:focus-visible,
  .filters select:focus-visible,
  .filters button:focus-visible,
  .filters summary:focus-visible {
    outline: 2px solid #4D148C;
    outline-offset: 2px;
  }

  .filter-error {
    margin: 0.5rem 0 0;
    color: #a32121;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    .filter-range {
      grid-template-columns: minmax(0, 1fr);
      gap: 0.5rem;
    }

    .range-separator {
      display: none;
    }
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
    box-sizing: border-box;
    min-width: 0;
    min-height: 56px;
    padding: 14px 20px;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    background-color: #f6f3f8;
    color: #302738;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
  }

  .shift-heading {
    font-weight: 600;
    color: #4D148C;
  }

  .shift-status {
    font-size: 0.8rem;
    font-weight: 600;
    color: #FF6600;
  }

  .shift-option.claimed .shift-status {
    font-size: 1rem;
    font-weight: 400;
    color: #302738;
  }

  .shift-canceled {
    font-size: 0.8rem;
    font-weight: 600;
    color: red;
  }

  .shift-option:hover {
    background-color: #ece3f3;
  }

  .shift-option.selected {
    background-color: #ece3f3;
    border-color: #4D148C;
    box-shadow: 0 0 0 1px #4D148C;
  }

  .shift-option:focus-visible {
    outline: 2px solid #4D148C;
    outline-offset: 3px;
  }
</style>
