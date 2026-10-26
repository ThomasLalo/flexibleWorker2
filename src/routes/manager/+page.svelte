<script lang="ts">
  import WarningIcon from '#lib/WarningIcon.svelte';
  import {locations, roster, type Shift} from '#lib/shared.svelte.ts';
  import { goto } from '$app/navigation';


  let loc = $state('123 Address Dr.');
  let sd = $state("2026-09-28");
  let ed = $state("2026-09-30");
  let st = $state('08:00');
  let et = $state('20:00');

  let selectedLocation = $derived(locations.find(item => item.address === loc));

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
//idk

  let selectedShift: Shift | null = $state(null);

  function toggle(shift: Shift) {
    if (selectedShift === shift) {
      selectedShift = null;
      return;
    }
    selectedShift = shift;
  }

  function clickedAddJob() {
    const params = new URLSearchParams({location: loc, startDate:sd, endDate:ed, startTime:st, endTime:et})
    goto(`/worker/add-job${params}`);
  }

  function clickedEditJob() {
    const indexOfSelectedShift = selectedLocation.shifts.findIndex(shift => shift === selectedShift)
    const params = new URLSearchParams({location: loc, startDate:sd, endDate:ed, startTime:st, endTime:et, index:indexOfSelectedShift})
    goto(`/worker/edit-job${params}`);
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

      <div>
        <h2>{selectedLocation.address}</h2>

        {#each shiftsInRange as shift}
          <div class={["shift", !shift.worker && "shift-unclaimed", shift.canceled && "shift-canceled", shift === selectedShift && "selected"]} onclick={() => toggle(shift)}>
            <div class="shift-details">
              <span class="shift-date">{shift.month}/{shift.day}</span>
              <span class="shift-time">{shift.startTime}:00 - {shift.endTime}:00</span>
            </div>

            <div class="shift-actions">
              {#if !shift.worker}
                <span class="shift-status">Unlcaimed</span>
                <WarningIcon />
              {:else if shift.canceled}
                <span class="shift-status">Canceled</span>
                <WarningIcon />
              {/if}
              {#if shift === selectedShift}
                <button type="button" onclick={clickedEditJob}>Edit Job</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  </main>
  <!--
  <div class = "main-layout">
    <div class = "location-shifts">

      <div class="filters">
        <fieldset>
          <legend>Location</legend>
          <select aria-label="Location">
            <option>123 Address Dr.</option>
            <option>456 Oak St.</option>
            <option>789 Maple Ave.</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Date range</legend>
          <input type="date" aria-label="Start date" value="2026-09-28" />
          -
          <input type="date" aria-label="End date" value="2026-09-30" />
        </fieldset>
        <fieldset>
          <legend>Time of day</legend>
          <input type="time" aria-label="Start time" value="08:00" />
          -
          <input type="time" aria-label="End time" value="20:00" />
        </fieldset>
      </div>

      <div class="location-title">
        <h2>123 Address Dr.</h2>
        <!-- <button type="button">View Calendar</button> --/>
      </div>
      <hr>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/28</span>
          <span class="shift-time">12 PM - 8 PM</span>
        </div>
      </div>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/28</span>
          <span class="shift-time">9 AM - 5 PM</span>
        </div>
      </div>

      <div class = "shift selected">
        <div class="shift-details">
          <span class="shift-date">9/29</span>
          <span class="shift-time">8 AM - 4 PM</span>
        </div>
        <div class="shift-actions">
          <button type="button">Edit Job</button>
          <button type="button">Remove Job</button>
        </div>
      </div>

      <div class = "shift">
        <div class="shift-details">
          <span class="shift-date">9/30</span>
          <span class="shift-time">10 AM - 6 PM</span>
          <span class="shift-status">Unclaimed</span>
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 3.5C12.8 2.3 11.2 2.3 10.5 3.5L1.3 19.5C0.6 20.7 1.5 22.2 2.9 22.2H21.1C22.5 22.2 23.4 20.7 22.7 19.5L13.5 3.5Z" stroke="#FF0000" stroke-width="1" />
          <rect x="11" y="8" width="2" height="7" rx="1" fill="#FF0000"/>
          <circle cx="12" cy="17.5" r="1.2" fill="#FF0000"/>
        </svg>
      </div>

      <div class="location-actions">
        <button type="button">Add Job</button>
      </div>

    </div>

    <div class="donut-charts">
    
      <div class = "chart">
        <h2>Punctuality </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="85 15" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            85%
          </text>
        </svg>
      </div>

      <div class = "chart">
        <h2>Attendance  </h2>
        <svg width="100%" height="100%" viewBox="0 0 42 42" class="donut">
          <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
          <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="3"></circle>
          <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="purple" stroke-width="3" stroke-dasharray="66 34" stroke-dashoffset="25"></circle>
          <text x="21" y="21" text-anchor="middle" dominant-baseline="central" font-size="6">
            66%
          </text>
        </svg>
      </div>

    </div>

  </div>

</main>
-->

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
    color: purple;
  }


  /* .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  } */

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

  .main-layout {
    display: flex;
    gap: 4rem;
    padding-bottom: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .shift {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    border: 1px solid purple;
    box-shadow: 0 0 0 1px purple;
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
    color: purple;
  }

  .shift-status {
    font-size: 0.875rem;
    font-weight: 600;
    color: #b42318;
  }

  .shift svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .shift-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .shift-unclaimed .shift-status,
  .shift-unclaimed .shift-actions {
    color:orange;
  }

  .shift-canceled .shift-status,    
  .shift-canceled .shift-actions {
  color: red;
  }

  .shift-actions button {
    padding: 0.4rem 0.9rem;
    font: inherit;
    font-size: 1rem;
    cursor: pointer;
  }

  .location-title {
    display: flex;
    align-items: center;
    justify-content:left;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .location-title h2 {
    margin: 0;
  }

  .location-shifts {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .location-shifts > hr {
    margin: 0;
  }

  .location-actions {
    display: flex;
    gap: 1rem;
  }

  .filters input,
  .filters select,
  .location-actions button {
    padding: 0.5rem 1rem;
    font: inherit;
    cursor: pointer;
  }

  .donut-charts {
    flex: 1;
    display: flex;
    /* flex-direction: column; */
    justify-content: space-around;
    min-width: 0;
  }

  .chart {
    text-align: center;
  }

  .donut {
    width: 150px;
    max-width: 100%;
    height: auto;
  }

</style>