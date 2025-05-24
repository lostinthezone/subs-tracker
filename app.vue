<template>
  <div>
    <h1>Substitution Tracker</h1>
    <h2>Total Time: {{ formatTime(totalTime) }}</h2>
    <div class="lists">
      <div class="list">
        <h2>On Field</h2>
        <ul>
          <li v-for="player in onFieldPlayers" :key="player.id">
            {{ player.name }} - {{ formatTime(player.timeOnField) }} ({{ formatTime(player.totalTimeOnField) }} {{ player.subNow }})
            <button @click="substitute(player, 'off')">Sub Off</button>
          </li>
        </ul>
      </div>
      <div class="list">
        <h2>Off Field</h2>
        <ul>
          <li v-for="player in offFieldPlayers" :key="player.id">
            {{ player.name }} - {{ formatTime(player.timeOffField) }} ({{ formatTime(player.totalTimeOffField) }})
            <button @click="substitute(player, 'on')">Sub On</button>
          </li>
        </ul>
      </div>
    </div>
    <button @click="toggleTimer">{{ isRunning ? "Stop" : "Start" }}</button>
    <button @click="resetTimer">Reset</button>
<!--    <button @click="swapTopPlayers">Swap</button>-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalTime: 0,
      startTime: null,
      onFieldPlayers: [
        { id: 1, name: "Player 1", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false },
        { id: 2, name: "Player 2", timeOnField: 0, totalTimeOnField: 0, totalTimeOffField: 0, subNow: false }
      ],
      offFieldPlayers: [
        { id: 3, name: "Player 3", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false },
        { id: 4, name: "Player 4", timeOffField: 0, totalTimeOffField: 0, totalTimeOnField: 0, subNow: false }
      ],
      isRunning: false,
      interval: null
    };
  },
  methods: {
    substitute(player, status) {
      if (status === "off") {
        this.offFieldPlayers.push({ ...player, timeOffField: 0 });
        this.onFieldPlayers = this.onFieldPlayers.filter(p => p.id !== player.id);
      } else {
        this.onFieldPlayers.push({ ...player, timeOnField: 0, subNow: false });
        this.offFieldPlayers = this.offFieldPlayers.filter(p => p.id !== player.id);
      }
    },
    // swapTopPlayers() {
    //   if (this.onFieldPlayers.length > 0 && this.offFieldPlayers.length > 0) {
    //     const onFieldTop = this.onFieldPlayers.shift();
    //     const offFieldTop = this.offFieldPlayers.shift();
    //
    //     this.onFieldPlayers.unshift(offFieldTop);
    //     this.offFieldPlayers.unshift(onFieldTop);
    //   }
    // },
    resetTimer() {
      this.totalTime = 0;
    },
    toggleTimer() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.interval = setInterval(() => {
          this.totalTime++;
          this.onFieldPlayers.forEach(player => { 
            player.timeOnField++; 
            player.totalTimeOnField++;
            if (player.timeOnField > 10) {
              player.subNow = true;
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