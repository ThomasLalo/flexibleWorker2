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
    children: Snippet;
  } = $props();

  // A worker is supplied only by claim-job, the manager pages show all roles
  const isClaimPage = $derived(worker !== undefined);

  // new Date("" + "T00:00") would cause an error
  const startDate = $derived(sd ? new Date(sd + "T00:00") : null);
  const endDate = $derived(ed ? new Date(ed + "T00:00") : null);
  // parseInt("") === NaN
  const startHour = $derived(st ? parseInt(st) : null);
  const endHour = $derived(et ? parseInt(et) : null);

  const shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const year = startDate?.getFullYear() ??
        (isClaimPage ? endDate?.getFullYear() : undefined) ?? new Date().getFullYear();
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
</script>

<main>
  <div class="panel">
    <div class="control-panel">
      <a href={isClaimPage ? resolve('/worker') : resolve('/manager')}>&lt;&lt;&lt; Back to dashboard</a>
      <h1>{selectedLocation?.address}</h1>
      <fieldset>
        <legend>Date Range</legend>
        <input type="date" aria-label="Start date" bind:value={sd}
          onchange={() => { if (isClaimPage) selectedDay = null; }} />
        -
        <input type="date" aria-label="End date" bind:value={ed}
          onchange={() => { if (isClaimPage) selectedDay = null; }} />
      </fieldset>

      <fieldset>
        <legend>Time Range</legend>
        <input type="time" aria-label="Start time" bind:value={st}
          onchange={() => { if (isClaimPage) selectedDay = null; }} />
        -
        <input type="time" aria-label="End time" bind:value={et}
          onchange={() => { if (isClaimPage) selectedDay = null; }} />
      </fieldset>

      <button type="button" aria-label="clear filters" onclick={clearFilters}>
        {isClaimPage ? 'Clear filters' : 'clear filters'}
      </button>
    </div>

    <Calender {claimedShifts} {unclaimedShifts} {startDate} {endDate}
      bind:selectedDay bind:selectedShift/>
  </div>

  <div class="panel claim-panel">
    <!-- The add/edit forms stay above the list; claim's confirmation stays below it. -->
    {#if !isClaimPage}{@render children()}{/if}

    <h2>
      {selectedDay
        ? `Shifts for ${selectedDay.month}/${selectedDay.day}/${selectedDay.year}`
        : 'Shifts in range'}
    </h2>

    <div class="day-shift-list">
      {#each (selectedDay ? shiftsForSelectedDay : isClaimPage ? unclaimedShifts : shiftsInRange) as shift (shift)}
        <button type="button" class="shift-option"
          class:claimed={Boolean(shift.worker)}
          class:selected={shift === selectedShift}
          onclick={() => selectedShift = shift}>
          {#if selectedDay || isClaimPage}
            <span>{shift.startTime}:00-{shift.endTime}:00 - {shift.role.charAt(0).toUpperCase()+ shift.role.slice(1)}</span>
            <span>{shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
          {:else}
            <span>{shift.month}/{shift.day} {shift.startTime}:00 - {shift.endTime}:00 </span>
            <span>{shift.role.charAt(0).toUpperCase() + shift.role.slice(1)} - {shift.worker ? `Claimed by ${shift.worker}` : 'Available'}</span>
          {/if}
          {#if shift.canceled}<span>Canceled</span>{/if}
        </button>
      {:else}
        <p>No matching shifts on this day.</p>
      {/each}
    </div>

    {#if selectedShift}
      <p>
        Selected: {selectedShift.month}/{selectedShift.day},
        {selectedShift.startTime}:00-{selectedShift.endTime}:00
      </p>
    {/if}

    {#if isClaimPage}{@render children()}{/if}
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
</style>
