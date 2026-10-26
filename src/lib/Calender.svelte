<script module lang="ts">
    export type CalendarDay = { year: number; month: number; day: number };
</script>

<script lang="ts">
    import type { Shift } from '#lib/shared.svelte.ts';
    let {
        claimedShifts,
        unclaimedShifts,
        startDate = new Date(),
        endDate = new Date(),
        selectedDay = $bindable(null),
        selectedShift = $bindable(null)
    }: {
        claimedShifts: Shift[];
        unclaimedShifts: Shift[];
        startDate?: Date;
        endDate?: Date;
        selectedDay?: CalendarDay | null;
        selectedShift?: Shift | null;
    } = $props();

    const shifts = $derived([
        ...claimedShifts,
        ...unclaimedShifts
    ]);
    
    // reactive state variables that don't react to changes to props
    // changes to props never happen. the docs will tell you this should be $derived because the data comes from reactive $props, but that only makes sense if props change
    // this is me being stubborn about what making the code written in a way implies what it actually does. so I'm supressing the warnings.
    // svelte-ignore state_referenced_locally
    let year = $state(startDate.getFullYear());
    // svelte-ignore state_referenced_locally
    let month = $state(startDate.getMonth()+1); // 1-based

    // svelte-ignore state_referenced_locally
    const startMonth = startDate.getMonth()+1;
    // svelte-ignore state_referenced_locally
    const startDay = startDate.getDate();
    // svelte-ignore state_referenced_locally
    const endMonth = endDate.getMonth()+1;
    // svelte-ignore state_referenced_locally
    const endDay = endDate.getDate();

    const monthNames = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];

    //takes 0 based month
    let firstDayOffset = $derived(new Date(year, month - 1, 1).getDay());
    //takes 1 based month
    let daysInMonth = $derived(new Date(year, month, 0).getDate());

    function getShiftsForDay(day: number): Shift[] {
        return shifts.filter(shift => shift.month === month && shift.day === day);
    };

    function isInRange(day: number): boolean {
        const afterStart = month > startMonth || (month === startMonth && day >= startDay);
        const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
        return afterStart && beforeEnd;
    };

    function changeMonth(direction: string) {
        switch(direction) {
            case "next":
                if (month === 12) {
                    month = 1;
                } else {
                    month += 1;
                }
                break;
            case "previous":
                if (month === 1) {
                    month = 12;
                } else {
                    month -= 1;
                }
                break;
        }
    }

</script>

<div class="month">
    <button onclick={() => changeMonth("previous")}>&lt;</button>
    <h1>{monthNames[month-1]}</h1>
    <button onclick={() => changeMonth("next")}>&gt;</button>
</div>
<div class="calendar">

    <div class="label" id="Sunday">Sunday</div>
    <div class="label" id="Monday">Monday</div>
    <div class="label" id="Tuesday">Tuesday</div>
    <div class="label" id="Wednesday">Wednesday</div>
    <div class="label" id="Thursday">Thursday</div>
    <div class="label" id="Friday">Friday</div>
    <div class="label" id="Saturday">Saturday</div>

    {#each {length: firstDayOffset} }
        <div class="day empty"></div>
    {/each}

    {#each { length: daysInMonth }, i}
        {@const dayShifts = getShiftsForDay(i + 1)}
        {@const isSelected = selectedDay?.year === year &&
            selectedDay?.month === month && selectedDay?.day === i + 1}

        <button type="button" class="day" class:in-range={isInRange(i + 1)}
            class:selected-day={isSelected}
            onclick={() => selectedDay = isSelected ? null : { year, month, day: i + 1 }}>
            <span class="day-header">
                <span>{i + 1}</span>
                {#if dayShifts.length > 3}
                    <span>+{dayShifts.length - 3}</span>
                {/if}
            </span>

        {#each dayShifts.slice(0, 3) as shift (shift)}
            <span class="shift" class:claimed={Boolean(shift.worker)}
                class:selected={shift === selectedShift}>
                {shift.startTime}:00–{shift.endTime}:00
            </span>
        {/each}

        </button>
    {/each}

</div>


<style>
h1 {
    color:#4D148C;
}
.month {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    max-width: 700px;
}

.label {
    font-weight: bold;
    text-align: center;
    padding-bottom: 4px;
    color:#4D148C;

}

.day {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    min-width: 0;
    aspect-ratio: 1;
    padding: 4px;
    border: 1px solid black;
    border-radius: 4px;
    background-color: white;
    color: black;
    font: inherit;
    text-align: left;
}

button.day {
    cursor: pointer;
}

.day.in-range {
    background-color: #EBDDF7;
}

button.day:hover,
.day.selected-day {
    background-color: #4D148C;
}

button.day:focus-visible {
    outline: 2px solid #4D148C;
    outline-offset: 2px;
}

.day.empty {
    border: none;
}

.day-header {
    display: flex;
    justify-content: space-between;
}

/* change day-header when day is hovered */
button.day:hover .day-header,
.day.selected-day .day-header {
    color: white;
}

.shift {
    background-color: #333333 ;
    text-align: center;
    font-size: 0.9rem;
    padding: 1px;
    margin: 1px 0;
    border-radius: 4px;
    color: white;
    box-sizing: border-box;
    display: block;
    width: 100%;
    font-family: inherit;
    border: none;
}

.shift.claimed {
    background-color: #FF6600;
    color: black;
}

.shift.selected {
    background-color: #2563EB;
    color: white;
}

</style>
