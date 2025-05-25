<script setup lang="ts">
  import {usePlayers} from "~/states";

  let playerName = useState<string>(() => "")
  let subInterval = useState<number>(() => 10);
  
  let players = usePlayers();
  
  function addPlayer(name: string) {
    console.log(name);
    // names.value.push(name);
    playerName.value = "";
    
    players.value.push(name);
  }
  
</script>

<template>
  <div class="flex flex-col p-2 gap-2">
    <span>Player name</span>
    <UInput v-model="playerName"></UInput>
    <UButton @click="addPlayer(playerName)">Add player</UButton>
    
    <h2>Players</h2>
    <ul>
      <li v-for="player in players" :key="player">{{ player }}</li>
    </ul>
    
    <span>Sub time</span>
    <UInput v-model="subInterval"></UInput>
    
    <UButton to="/play-game">Next</UButton>
    
  </div>
</template>

<style scoped></style>
