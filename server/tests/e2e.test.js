const assert = require('assert');

async function testE2E() {
  console.log('🧪 Running Authentic E2E Integration Tests...\n');

  // Test 1: Health check
  const healthRes = await fetch('http://localhost:5001/api/health').then(r => r.json());
  assert.strictEqual(healthRes.status, 'online');
  console.log('✓ Health Check OK');

  // Test 2: Pre-flight draft AI analysis for human content
  const humanAnalysis = await fetch('http://localhost:5001/api/posts/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Just finished sketching in my notebook at the local cafe. The rainy weather makes for great coffee inspiration!' })
  }).then(r => r.json());

  console.log('Human Analysis:', humanAnalysis.analysis);
  assert.strictEqual(humanAnalysis.analysis.aiProbability < 25, true);
  console.log('✓ Pre-flight Human Analysis OK');

  // Test 3: Attempting to create an AI-generated post should be blocked (>80% risk)
  const aiPostAttempt = await fetch('http://localhost:5001/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'u1',
      content: "As an AI language model, it is important to remember that this serves as a testament to unlocking the potential in an ever-evolving landscape."
    })
  });

  const aiPostRes = await aiPostAttempt.json();
  console.log('AI Post Attempt Response:', aiPostRes);
  assert.strictEqual(aiPostAttempt.status, 422, 'Server must reject AI text post with status 422');
  assert.strictEqual(aiPostRes.success, false);
  console.log('✓ Server AI Post Blocking Protection OK');

  // Test 4: Creating a valid human post
  const createRes = await fetch('http://localhost:5001/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'u1',
      content: 'Excited to announce my new handmade pottery collection! Every single vase is shaped by hand without any digital automation.'
    })
  }).then(r => r.json());

  assert.strictEqual(createRes.success, true);
  assert.strictEqual(createRes.post.is_human_verified, 1);
  console.log('✓ Human Post Creation & Verification OK');

  console.log('\n🎉 ALL E2E INTEGRATION TESTS PASSED CLEANLY!');
}

testE2E().catch(err => {
  console.error('❌ E2E test failure:', err);
  process.exit(1);
});
