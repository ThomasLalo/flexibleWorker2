<script lang="ts">
  import WarningIcon from '#lib/WarningIcon.svelte';

  type Shift = {
    date: string;
    time: string;
    canceled?: boolean;
    timeChanged?: boolean;
  };

  type Location = {
    address: string;
    shifts: Shift[];
  };

  // the whole array is a state variable
  // so whenever any values get changed the whole page would be re-rendered
  let locations: Location[] = $state([
    {
      address: "123 Address Dr.",
      shifts: [
        { date: "9/28", time: "9 AM - 5 PM" },
        { date: "9/29", time: "8 AM - 4 PM", canceled: true },
        { date: "9/30", time: "11 AM - 7 PM", timeChanged: true },
        { date: "10/1", time: "9 AM - 3 PM" },
      ],
    },
    {
      address: "456 Oak St.",
      shifts: [
        { date: "10/2", time: "8 AM - 2 PM" },
        { date: "10/3", time: "10 AM - 4 PM" },
        { date: "10/4", time: "12 PM - 6 PM" },
        { date: "10/5", time: "9 AM - 5 PM" },
      ],
    },
    { address: "789 Maple Ave.", shifts: [] },
  ]);

  let selectedShift: Shift | null = $state(null);

  function toggle(shift: Shift) {
    if (selectedShift === shift) {
      selectedShift = null;
      return;
    }
    selectedShift = shift;
  }

</script>

<main>
  <h1 class="dashboard-title">Employee Dashboard <hr /></h1>

  <div class="dashboard-columns">
    <section class="dashboard-panel">
      <h1>Scheduled Shifts</h1>

      {#each locations as location}
        <header class="location">
          <h2>{location.address}</h2>
          <button type="button">View Map</button>
        </header>

        {#each location.shifts as shift}
          <!-- svelte does not like that I made a div act like a button, for accessibility reasons. the next comment suppresses warnings about that -->
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <div class={["shift", shift.canceled && "shift-canceled", shift.timeChanged && "time-changed", shift === selectedShift && "selected"]} onclick={() => toggle(shift)} >

            <div class="shift-details">
              <span class="shift-date">{shift.date}</span>
              <span class="shift-time">{shift.time}</span>

              {#if shift.canceled}
                <span class="shift-status">Shift Canceled</span>
              {/if}

              {#if shift.timeChanged}
                <span class="shift-status">Time Changed</span>
              {/if}
            </div>

            <div class="shift-actions">
              {#if shift.canceled || shift.timeChanged}
                <WarningIcon />
              {/if}
              {#if shift === selectedShift}
                <button type="button">Remove Shift</button>
              {/if}
            </div>
          </div>
        {/each}
      {/each}
    </section>

    <section class="dashboard-panel">
      <h1>Claim Shifts</h1>

      <form class="filters" action ="/worker/claim-job">
        <fieldset>
          <legend>Location</legend>
          <select name = "location">
            {#each locations as location}
              <option>{location.address}</option>
            {/each}
          </select>
        </fieldset>

        <fieldset>
          <legend>Date range</legend>
          <input type="date" value="2026-09-28" name = "startDate"/>
          -
          <input type="date" value="2026-09-30" name = "endDate"/>
        </fieldset>

        <fieldset>
          <legend>Time of day</legend>
          <input type="time" value="08:00" name = "startTime" />
          -
          <input type="time" value="20:00" name = "endTime" />
        </fieldset>

        <button type="submit">View Available Shifts</button>
      </form>

    </section>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin-inline: auto;
    font-family: sans-serif;
  }

  h1 {
    color: purple;
  }

  .dashboard-title {
    margin: 0;
    padding: 2rem 2rem 0;
  }

  .dashboard-columns {
    display: flex;
    gap: 4rem;
    padding: 0 2rem 2rem;
  }

  .dashboard-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .location {
    display: flex;
    gap: 1rem;
  }

  .location button {
    font-size: 1rem;
    align-self: center;
  }

  .shift {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-sizing: border-box;
    min-height: 56px;
    padding: 0;
    border: 1px solid #dcd5e2;
    border-radius: 8px;
    background-color: #f6f3f8;
    color: #302738;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .shift.selected {
    background-color: #ece3f3;
    border-color: purple;
    box-shadow: 0 0 0 1px purple;
  }

  /* all the stuff on the left of the shift. date, time, and status */
  .shift-details {
    display: flex;
    flex: 1;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 12px;
    min-width: 0;
    box-sizing: border-box;
    min-height: 54px;
    padding: 14px 20px;
  }

  .shift-date {
    color: #6f6578;
    font-size: 1rem;
  }

  .shift-time {
    color: purple;
    font-weight: 600;
  }

  .shift-status {
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* the stuff that is sometimes on the right. warning icons or remove shift button */
  .shift-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    margin-right: 20px;
  }

  /* when a shift div gets modified with .time-changed or .shift-canceled it changes the color of the warning icon or svg */
  /* there is probably a better way to do this */
  .time-changed .shift-status,
  .time-changed .shift-actions {
    color:orange;
  }

  .shift-canceled .shift-status,
  .shift-canceled .shift-actions {
    color: red;
  }

  .filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  .filters legend {
    margin-bottom: 0.35rem;
  }

  .filters input,
  .filters select,
  .filters button {
    padding: 6px 12px;
    font: inherit;
    cursor: pointer;
  }
</style>
