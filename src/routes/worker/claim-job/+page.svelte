<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { locations } from '#lib/shared.svelte.ts';
  import { roster } from '#lib/shared.svelte.ts';
  import type { Shift } from '#lib/shared.svelte.ts';
  import type { CalendarDay } from '#lib/Calender.svelte';
  import JobShared, { readJobFilters } from '#lib/JobShared.svelte';

  let selectedDay = $state<CalendarDay | null>(null);
  let selectedShift = $state<Shift | null>(null);

  function selectDay(day: CalendarDay | null) {
    selectedDay = day;
    selectedShift = null;
  }
  const worker = "Emma Johnson";
  const role = $derived(
    roster.find(person => person.name === worker)?.role
  );
  
  let loc = $state<string | null>(null);
  let dashboardFilters = $state<ReturnType<typeof readJobFilters> | null>(null);

  // Read the URL in the browser, after the page mounts.
  onMount(() => {
    const params = page.url.searchParams;
    dashboardFilters = readJobFilters(params);
    loc = dashboardFilters.loc;
  });

  const selectedLocation = $derived(locations.find(item => item.address === loc));

  function claimShift() {
    if (selectedShift !== null && !selectedShift.worker && !selectedShift.canceled) {
      selectedShift.worker = worker;
      goto(resolve('/worker'));
    }
  };

</script>

<JobShared {selectedLocation} {dashboardFilters} {worker} {role}
  bind:selectedDay={() => selectedDay, selectDay}
  bind:selectedShift>
  <h2>Claim Shift</h2>

  <button type="button" onclick={claimShift}
    disabled={!selectedShift || Boolean(selectedShift.worker) || selectedShift.canceled}>
    Claim shift
  </button>
</JobShared>
