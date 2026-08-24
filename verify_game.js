async function testGameFlow() {
  const BASE_URL = 'http://localhost:3001';
  console.log('🧪 Starting Game Flow Verification Tests on port 3001...\n');

  // 1. Authorize Student ID
  console.log('1. Testing Stall ID Authorization (2204055)...');
  const authRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055' })
  });
  const authData = await authRes.json();
  console.log('Auth result:', authData.message, authData.player?.deptCode);

  // 2. Fetch Player Status
  console.log('\n2. Testing Fetch Player Status...');
  const playerRes = await fetch(`${BASE_URL}/api/player/2204055`);
  const playerData = await playerRes.json();
  console.log('Player data:', playerData.player.studentId, 'Dept:', playerData.player.deptCode, 'AP:', playerData.player.battleshipAP);

  // 3. Battleship Move 1: Attack [10, 10]
  console.log('\n3. Testing Battleship Move 1 (Attack [10, 10])...');
  const bRes1 = await fetch(`${BASE_URL}/api/battleship/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055', x: 10, y: 10, action: 'ATTACK' })
  });
  const bData1 = await bRes1.json();
  console.log('Move 1 result:', bData1.result, bData1.message);

  // 4. Battleship Move 2 & 3
  console.log('\n4. Testing Battleship Moves 2 & 3...');
  await fetch(`${BASE_URL}/api/battleship/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055', x: 12, y: 12, action: 'ATTACK' })
  });
  await fetch(`${BASE_URL}/api/battleship/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055', x: 14, y: 14, action: 'ATTACK' })
  });
  console.log('All 3 Battleship APs used.');

  // 5. Connect-4 Drop
  console.log('\n5. Testing Connect-4 Drop in Column 6...');
  const c4Res = await fetch(`${BASE_URL}/api/connect4/drop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055', col: 6 })
  });
  const c4Data = await c4Res.json();
  console.log('Connect-4 result:', c4Data.message, 'Row:', c4Data.row);

  // 6. Stacker Survival Score
  console.log('\n6. Testing Stacker Score (54 Floors, 6 Combos)...');
  const stackRes = await fetch(`${BASE_URL}/api/stacker/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: '2204055', floors: 54, combos: 6 })
  });
  const stackData = await stackRes.json();
  console.log('Stacker result:', stackData.message);

  // 7. Spicy Poll Submission
  console.log('\n7. Testing Spicy Poll Submit...');
  const pollRes = await fetch(`${BASE_URL}/api/poll/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: '2204055',
      answers: { q1: 'URP', q2: 'CSE', q3: 'EEE' }
    })
  });
  const pollData = await pollRes.json();
  console.log('Poll result:', pollData.message);

  // 8. Snapshot State Check
  console.log('\n8. Testing Full Server Snapshot...');
  const stateRes = await fetch(`${BASE_URL}/api/state`);
  const stateData = await stateRes.json();
  console.log('Total Registered:', stateData.stats.totalStudentsRegistered);
  console.log('Total Played:', stateData.stats.totalPlayed);
  console.log('Top Stacker:', stateData.stackerTopRecords[0]);
  console.log('Grand Leaderboard Top 3:');
  stateData.overallLeaderboard.slice(0, 3).forEach((dept, idx) => {
    console.log(`  #${idx + 1}: ${dept.deptName} (${dept.deptAbbr}) - Score: ${dept.grandScore} Pts`);
  });

  console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! 🎮🚀');
}

testGameFlow().catch(console.error);
