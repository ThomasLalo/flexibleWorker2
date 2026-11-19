<script lang="ts">
  import WarningIcon from '#lib/WarningIcon.svelte';
  import {locations, roster, type Shift} from '#lib/shared.svelte.ts';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  let loc = $state('123 Address Dr.');
  let sd = $state("2026-09-28");
  let ed = $state("2026-09-30");
  let st = $state('08:00');
  let et = $state('20:00');

  let selectedLocation = $derived(locations.find(item => item.address === loc))!;

  let startDate = $derived(new Date(sd + "T00:00"));
  let endDate = $derived(new Date(ed + "T00:00"));
  let startHour = $derived(parseInt(st));
  let endHour = $derived(parseInt(et));

  let shiftsInRange: Shift[] = $derived(
    selectedLocation?.shifts.filter(shift => {
      const date = new Date(startDate.getFullYear(), shift.month - 1, shift.day);
      return (
        date >= startDate &&
        date <= endDate &&
        shift.startTime >= startHour &&
        shift.endTime <= endHour 
      );
    }) ?? [] //typescript warning avoidance
  );

  let selectedShift: Shift | null = $state(null);

  function toggle(shift: Shift) {
    if (selectedShift === shift) {
      selectedShift = null;
      return;
    }
    selectedShift = shift;
  }

  function clickedAddJob() {
    const params = new URLSearchParams({location: loc, startDate:sd, endDate:ed, startTime:st, endTime:et});
    goto(`${resolve('/manager/add-job')}?${params}`);
  }

  function clickedEditJob() {
    const indexOfSelectedShift = selectedLocation.shifts.findIndex(shift => shift === selectedShift).toString();
    const params = new URLSearchParams({location: loc, startDate:sd, endDate:ed, startTime:st, endTime:et, index:indexOfSelectedShift});
    goto(`${resolve('/manager/edit-job')}?${params}`);
  }

  function removeShift(shift: Shift) {
    shift.canceled = true;
    selectedShift = null;
  }

  function gotoRoster() {
    goto(resolve('/manager/roster'));

  }
</script>

<main>
  <h1>Manager Dashboard <hr> </h1>

  <div class="main-layout">
    <div class="location-shifts">
      <div class="filters">

        <fieldset>
          <legend>Location</legend>
          <select bind:value={loc}>
            <option value="" disabled>Choose a location</option>
            {#each locations as l}
              <option value={l.address}>{l.address}</option>
            {/each}
          </select>
        </fieldset>

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

        <fieldset>
        <button type="button" onclick={clickedAddJob}>Add Job</button>
        </fieldset>
      </div>

      <div class="location-shifts">
        <h2>{selectedLocation.address}</h2>

        {#each shiftsInRange as shift}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div class={["shift", !shift.worker && "shift-unclaimed", shift.canceled && "shift-canceled", shift === selectedShift && "selected"]} onclick={() => toggle(shift)}>
            <div class="shift-details">
              <span class="shift-date">{shift.month}/{shift.day}</span>
              <span class="shift-time">{shift.startTime}:00 a.m. - {shift.endTime-12}:00 p.m.</span>
            </div>


            <span class="shift-date">{shift.role.charAt(0).toUpperCase()+ shift.role.slice(1)}</span>
            <div>
            {#if shift.worker}
              <span class="shift-worker">· {shift.worker}</span>
            {/if}

            </div>


            <div class="shift-actions">
              <div class="shift-warnings">
                {#if !shift.worker}
                  <div class="shift-warning">
                    <WarningIcon />
                    <span>Unclaimed</span>
                  </div>
                {/if}
                {#if shift.canceled}
                  <div class="shift-warning">
                    <WarningIcon />
                    <span>Canceled</span>
                  </div>
                {/if}
              </div>

              <div class="shift-buttons">
                {#if shift === selectedShift}
                  <button type="button" onclick={(event) => {event.stopPropagation();clickedEditJob();}}>Edit Shift</button>
                  <button type="button" onclick={(event) => {event.stopPropagation(); removeShift(shift);}}>Remove Shift</button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="roster">
      <h2>Roster<hr></h2>
      {#each roster as worker}
        <div class="worker-card">{worker.name}
            <div class="worker-info">
              <span class = "job-title">{worker.role.charAt(0).toUpperCase()+ worker.role.slice(1)} - </span>
              <span title="Punctuality">Punctuality {worker.punctuality}% - </span>
              <span title="Attendance">Attendance {worker.attendance}%</span>
            </div>
        </div>
      {/each}
      <button type="button" onclick={gotoRoster}>View Full Roster</button>
    </div>
  </div>

  </main>
 

<style>
  main {
    font-family: sans-serif;
    max-width: 1200px;
    margin-inline: auto;
  }
  
  h1 {
    padding-top: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
    margin: 0;
    color: #4D148C;
  }

  .worker-info {
    color: #6f6578;
    font-size: 1rem;
  }

  .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    background-color: #faf8fc;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
  }

  .filters legend {
    margin-bottom: 0.35rem;
  }

  .filters fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }
    @media (max-width: 800px) {
      .main-layout {
        flex-direction: column;
      }
  }
  .main-layout {
    display: flex;
    gap: 4rem;
    padding-bottom: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .shift {
    display: grid;
    align-items: center;
    grid-template-columns: auto auto 1fr max-content;
    justify-content:space-between;
    gap: 1rem;

    background-color: #f6f3f8;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 14px 20px;
    min-height: 56px;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
    color: #302738;
  }

  .worker-card {
    display: flex;
    /* align-items: center; */
    justify-content:space-between;
    gap: 1rem;

    background-color: #f6f3f8;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    padding: 14px 20px;
    min-height: 56px;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
    color: #302738;
  }

  .shift.selected {
    background-color: #ece3f3;
    border: 1px solid #4D148C;
    box-shadow: 0 0 0 1px #4D148C;
  }

  .shift-details {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .shift-date {
    font-size: 1rem;
    color: #6f6578;
  }

  .shift-time {
    font-weight: 600;
    color: #4D148C;
  }

  .shift-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .shift-warnings,
  .shift-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }

  .shift-warning {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .shift-warning svg {
    width: 16px;
    height: 16px;
  }

  .shift-buttons button {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .shift-worker {
    font-size: 1rem;
    color:#302738;
  }

  .shift-unclaimed .shift-status,
  .shift-unclaimed .shift-actions {
    color:#FF6600;
  }

  .shift-canceled .shift-status,    
  .shift-canceled .shift-actions {
  color: red;
  }

  .shift-actions button {
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .location-shifts {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .roster {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .roster button {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .filters input,
  .filters select,
  .filters button {
    padding: 0.5rem 1rem;
    font: inherit;
    cursor: pointer;
  }

</style>
