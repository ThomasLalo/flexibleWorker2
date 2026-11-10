<script lang="ts">
import { notifications, removeNotification } from '#lib/notifications.svelte.ts';

// who this box is for, passed in from the page
let {recipient}:  {recipient: string} = $props();

// notifications for this person, plus "all" ones for workers (not the manager)
let myNotices = $derived(
    notifications.filter(notice =>
        notice.to === recipient || (notice.to === "all" && recipient !== "manager")
    )
);

</script>

<!-- title with the bell icon for the notifications -->
<section class = "notification-box">
    <h2>
    <svg viewBox = "0 0 24 24" fill= "none" stroke = "currentColor" stroke-width = "1.5" class = "bell">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
    NOTIFICATIONS
    </h2>
    {#if myNotices.length === 0}
    <p class = "empty" > No notifications</p>
    {:else}
    <ul>
        {#each myNotices as notice (notice.id)}
        <li>
            <span class = "time" > {notice.time}</span>
            <span class = "message" > {notice.message}</span>
            <button type = "button" onclick = {() => removeNotification(notice.id)} > Dismiss </button>
        </li>
        {/each}
    </ul>
    {/if}
</section>



<style>
.notification-box{
  margin: 1rem 2rem;
  padding: 1rem 0;
  border-top: 2px solid #4D148C;
  border-bottom: 2px solid #4D148C;
  font-family: sans-serif;
}

h2{
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 .75rem;
    color: black;
}

.empty{
    color: lightslategrey;
    min-width: 5rem;
}

.bell{
    width: 24px;
    height: 24px;
    color: #FF6600;
}

ul{
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: .4rem;
}

li{
    display: flex;
    gap: 1rem;
    align-items: center;
}

.time{
    color: #6F6578;
    min-width: 5rem;
}

.message{
    flex: 1;
}

/* @media (max-width: 600px) {
    .notification-box {
        margin: 1rem;
    }
    li {
        flex-wrap: wrap;
    }
}*/
</style>