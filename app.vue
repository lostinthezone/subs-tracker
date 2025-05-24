<template>
  <UApp>
  <div>
    <h1>Substitution Tracker</h1>
    <div class="flex">
    <h2 class="mr-5">Total Time: {{ formatTime(totalTime) }}</h2><UBadge v-if="isRunning" color="neutral">Running</UBadge> <p class="ml-4">Sub time: 10 seconds</p>
    </div>
    <div class="lists">
      <div class="list" style="width: 100%">
        <h2>On Field <UIcon name="i-lucide-circle-play" class="size-5" /></h2>
        <ul>
          <li v-for="player in onFieldPlayers" :key="player.id" class="mb-4">

<!--            <UCheckbox></UCheckbox> -->
            {{ player.name }} - {{ formatTime(player.timeOnField) }} ({{ formatTime(player.totalTimeOnField) }}) <UBadge color="neutral" v-if="player.subNow === true">Sub</UBadge>
            <UButton @click="substitute(player, 'off')"  trailing-icon="i-lucide-arrow-right" size="md" class="ml-4">Sub Off</UButton>
          </li>
          <li v-if="onFieldPlayers.length === 0">
            <UBadge color="neutral">No players on the field</UBadge>
          </li>          
        </ul>
      </div>
      <div class="list" style="width: 100%">
        <h2>Off Field <UIcon name="i-lucide-circle-pause" class="size-5" /></h2>
        <ul>
          <li v-for="player in offFieldPlayers" :key="player.id" class="mb-4">
<!--            <UCheckbox></UCheckbox> -->
            {{ player.name }} - {{ formatTime(player.timeOffField) }} ({{ formatTime(player.totalTimeOffField) }})
            <UButton @click="substitute(player, 'on')" trailing-icon="i-lucide-arrow-left" size="md">Sub On</UButton>
          </li>
          <li v-if="offFieldPlayers.length === 0">
            <UBadge color="neutral">No players off the field</UBadge>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-5">
    <UButton @click="toggleTimer" trailing-icon="i-lucide-clock">{{ isRunning ? "Stop" : "Start" }}</UButton>
    <UButton @click="resetTimer" class="ml-2" trailing-icon="i-lucide-circle-x">Reset</UButton>
      
<!--    <UButton @click="swapTopPlayers">Swap</UButton>-->
    </div>
    <div class="list">
      <ul>
        <li v-for="hist in history" :key="hist" class="mb-4">{{ hist }} </li>
      </ul>
    </div>
  </div>
  </UApp>
</template>

<script>
export default {
  data() {
    return {
      totalTime: 0,
      startTime: null,
      onFieldPlayers: [
        { id: 1, name: "Player 1", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field" },
        { id: 2, name: "Player 2", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false, position: "field" }
      ],
      offFieldPlayers: [
        { id: 3, name: "Player 3", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field" },
        { id: 4, name: "Player 4", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false, position: "field" }
      ],
      isRunning: false,
      interval: null,
      history: []
    };
  },
  methods: {
    substitute(player, status) {
      if (status === "off") {
        // this.history.push(new Date().toLocaleTimeString() + ": player " + player.name + " went off field"); // with " + formatTime(player.timeOnField) + " seconds on field");
        this.history.push(new Date().toLocaleTimeString() + ": player " + player.name + " went off field with "+ this.formatTime(player.timeOnField) + " time on field");
        this.offFieldPlayers.push({ ...player, timeOffField: 0 });
        this.onFieldPlayers = this.onFieldPlayers.filter(p => p.id !== player.id);
      } else {
        this.history.push(new Date().toLocaleTimeString() + ": player " + player.name + " went on field");
        this.onFieldPlayers.push({ ...player, timeOnField: 0, subNow: false });
        this.offFieldPlayers = this.offFieldPlayers.filter(p => p.id !== player.id);
      }
    },
    swapTopPlayers() {
      // if (this.onFieldPlayers.length > 0 && this.offFieldPlayers.length > 0) {
      //   const onFieldTop = this.onFieldPlayers.shift();
      //   const offFieldTop = this.offFieldPlayers.shift();
      //
      //   // Move the swapped players to the end of their new lists
      //   this.onFieldPlayers.push(offFieldTop);
      //   this.offFieldPlayers.push(onFieldTop);
      // }
    },
    resetTimer() {
      this.history.push(new Date().toLocaleTimeString() + ": timer reset");
      this.totalTime = 0;
    },
    toggleTimer() {
      if (this.isRunning) {
        this.history.push(new Date().toLocaleTimeString() + ": timer stopped");
        clearInterval(this.interval);
        this.isRunning = false;
      } else {
        this.history.push(new Date().toLocaleTimeString() + ": timer started");
        this.isRunning = true;
        this.interval = setInterval(() => {
          this.totalTime++;
          this.onFieldPlayers.forEach(player => { 
            player.timeOnField++; 
            player.totalTimeOnField++;
            if (player.timeOnField > 10) {
              player.subNow = true;
              navigator.vibrate(100);
            }
          });
          this.offFieldPlayers.forEach(player => { 
            player.timeOffField++; 
            player.totalTimeOffField++; 
          });
        }, 1000);
      }
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.lists {
  display: flex;
  gap: 20px;
}
.list {
  border: 1px solid #ddd;
  padding: 10px;
}
</style>