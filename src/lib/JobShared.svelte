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
    sd = $bindable(""),
    ed = $bindable(""),
    st = $bindable(""),
    et = $bindable(""),
    selectedDay = $bindable(null),
    selectedShift = $bindable(null),
    clearFilters,
    worker,
    role,
    pageError = "",
    children
  }: {
    selectedLocation: Location | undefined;
    sd?: string;
    ed?: string;
    st?: string;
    et?: string;
    selectedDay?: CalendarDay | null;
    selectedShift?: Shift | null;
    clearFilters: () => void;
    worker?: string;
    role?: string;
    pageError?: string;
    children: Snippet;
  } = $props();

  let dialog: HTMLDialogElement;

  $effect(() => {
    if (selectedDay) dialog.showModal();
    else dialog.close();
  });

  function closeDay() {
    selectedDay = null;
    selectedShift = null;
  }

  // A worker is supplied only by claim-job, the manager pages show all roles
  const isClaimPage = $derived(worker !== undefined);

  // new Date("" + "T00:00") would cause an error
  const startDate = $derived(sd ? new Date(sd + "T00:00") : null);
  const endDate = $derived(ed ? new Date(ed + "T00:00") : null);
  // parseInt("") === NaN
  const startHour = $derived(st ? parseInt(st) : null);
  const endHour = $derived(et ? parseInt(et) : null);
  const hasFilters = $derived(Boolean(sd || ed || st || et));
  const invalidDateRange = $derived(Boolean(sd && ed && sd > ed));
  const invalidTimeRange = $derived(
    startHour !== null && endHour !== null && startHour > endHour
  );

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const year = startDate?.getFullYear() ??
        endDate?.getFullYear() ?? new Date().getFullYear();
      const date = new Date(year, shift.month - 1, shift.day);
      return (
        // if null give true since that part of the filter does not apply
        (!startDate || date >= startDate) &&
        (!endDate || date <= endDate) &&
        (startHour === null || shift.startTime >= startHour) &&
        (endHour === null || shift.endTime <= endHour) &&
        (!isClaimPage || shift.role == role)
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
        <details>
          <summary>
            <strong>Filter by date and time</strong>
            <span class="filter-summary">
              {#if !hasFilters}
                All dates and times
              {:else}
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
                  onchange={() => { selectedDay = null; }} />
                <span class="range-separator">-</span>
                <input type="date" aria-label="End date" bind:value={ed}
                  onchange={() => { selectedDay = null; }} />
              </div>
              {#if invalidDateRange}
                <p class="filter-error">End date must be on or after the start date.</p>
              {/if}
            </fieldset>

            <fieldset>
              <legend>Time Range</legend>
              <div class="filter-range">
                <input type="time" aria-label="Start time" bind:value={st}
                  onchange={() => { selectedDay = null; }} />
                <span class="range-separator">-</span>
                <input type="time" aria-label="End time" bind:value={et}
                  onchange={() => { selectedDay = null; }} />
              </div>
              {#if invalidTimeRange}
                <p class="filter-error">End time must not be before the start time.</p>
              {/if}
            </fieldset>

            <button type="button" aria-label="clear filters" onclick={clearFilters}
              disabled={!hasFilters}>
              Clear filters
            </button>
          </div>
        </details>
      </div>


    </div>

    <p>Select a day to view shifts and continue.</p>
    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate}
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
            <span>{shift.startTime}:00-{shift.endTime}:00 - {shift.role.charAt(0).toUpperCase()+ shift.role.slice(1)}</span>
            <span>{shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
            {#if shift.canceled}<span>Canceled</span>{/if}
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

  .filters input {
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
